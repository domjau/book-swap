#!/bin/bash
# q <user-uuid|anon> "<sql>"  -> runs as that user, prints result or ERROR
A=11111111-1111-1111-1111-111111111111; B=22222222-2222-2222-2222-222222222222; C=33333333-3333-3333-3333-333333333333
q() { local who=$1; shift; local role=authenticated; local sub=$who; [ "$who" = anon ] && role=anon && sub=''
  su postgres -c "psql -d bs -tA -v ON_ERROR_STOP=1 -c \"set role $role; set request.jwt.claim.sub = '$sub';\" -c \"$*\"" 2>&1 | grep -v '^SET$' | sed 's/^psql:.*ERROR: */ERROR: /' | tr '\n' ' ' | sed 's/ *$//'; echo; }
pass=0; fail=0
check() { local name=$1 expect=$2 got=$3
  if [[ "$got" == *"$expect"* ]]; then pass=$((pass+1)); echo "  ok   $name"; else fail=$((fail+1)); echo "  FAIL $name  (expected '$expect', got '$got')"; fi; }
su postgres -c "psql -d bs -q -c \"insert into auth.users values ('$A','ana@x'),('$B','ben@x'),('$C','cleo@x') on conflict do nothing\""

echo "== groups and invites"
out=$(q $A "select invite_code from create_group('Saturday School','Ana','DK','2700','{lt,es}','2026-11-15.3')"); CODE=$(echo $out | tr -d ' '); echo "  invite code: $CODE"
G1=$(q $A "select id from groups" | tr -d ' ')
check "wrong invite code rejected" "invalid or expired" "$(q $B "select join_group('WRONG123','Ben','DK','2720','{}','2026-11-15.3')")"
check "Ben joins with code" "$G1" "$(q $B "select join_group('$CODE','Ben','DK','2720','{}','2026-11-15.3')")"
q $C "select group_id from create_group('Other Group','Cleo','ES','28013','{es}','2026-11-15.3')" >/dev/null
check "Ben is plain member, cannot create invites" "only organisers" "$(q $B "select create_invite('$G1')")"
check "Ana (organiser) can create invites" "" "$(q $A "select length(create_invite('$G1'))")"

echo "== books"
BA=$(q $A "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$G1','$A','Zog','swap','{$G1/$A/1.jpg}') returning id" | awk '{print $1}')
BB=$(q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$G1','$B','Room on the Broom','give','{$G1/$B/1.jpg}') returning id" | awk '{print $1}')
check "Ben cannot add a book as Ana" "row-level security" "$(q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$G1','$A','Fake','swap','{x}')")"
check "book needs at least 1 photo" "violates check constraint" "$(q $A "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$G1','$A','No photo','swap','{}')")"
check "Cleo (other group) cannot add to group 1" "row-level security" "$(q $C "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$G1','$C','X','swap','{x}')")"
check "Ben sees group books (2)" "2" "$(q $B "select count(*) from books")"
check "Cleo sees none of group 1" "0" "$(q $C "select count(*) from books where group_id='$G1'")"
check "logged-out user sees nothing" "permission denied" "$(q anon "select count(*) from books")"
check "Ben cannot edit Ana's book (0 rows)" "UPDATE 0" "$(q $B "update books set title='hacked' where id='$BA'")"
check "Ana cannot set status directly" "permission denied" "$(q $A "update books set status='gone' where id='$BA'")"
check "Ben cannot delete Ana's book" "DELETE 0" "$(q $B "delete from books where id='$BA'")"
check "Cleo cannot see group 1 members" "0" "$(q $C "select count(*) from members where group_id='$G1'")"
check "Ben cannot make himself organiser" "permission denied" "$(q $B "update members set role='organiser' where user_id='$B'")"
check "invites table not readable" "permission denied" "$(q $A "select count(*) from group_invites")"

echo "== requests and chat"
check "Ben cannot request his own book" "cannot request your own" "$(q $B "select create_request('$B','{$BB}','{}','hi')")"
check "Ben cannot offer Ana's book as his" "not yours" "$(q $B "select create_request('$A','{$BA}','{$BA}','hi')")"
check "Cleo cannot request group-1 books" "not available" "$(q $C "select create_request('$A','{$BA}','{}','hi')")"
check "message with PDF link blocked" "not allowed" "$(q $B "select create_request('$A','{$BA}','{}','pdf here: https://drive.google.com/x')")"
R=$(q $B "select create_request('$A','{$BA}','{$BB}','Swap Zog for Room on the Broom?')" | tr -d ' ')
echo "  request: $R"
check "Ana sees the request" "1" "$(q $A "select count(*) from requests")"
check "Cleo sees no requests" "0" "$(q $C "select count(*) from requests")"
check "Cleo cannot read the chat" "0" "$(q $C "select count(*) from messages")"
check "Cleo cannot write into the chat" "row-level security" "$(q $C "insert into messages (request_id, sender_id, body) values ('$R','$C','hi')")"
check "Ben cannot post as Ana" "row-level security" "$(q $B "insert into messages (request_id, sender_id, body) values ('$R','$A','fake')")"
check "Ben cannot post system messages" "row-level security" "$(q $B "insert into messages (request_id, sender_id, kind, body) values ('$R','$B','system','x')")"
check "chat blocks e-book file" "row-level security" "$(q $B "insert into messages (request_id, sender_id, body) values ('$R','$B','see book.epub')")"
check "Ben can chat" "INSERT 0 1" "$(q $B "insert into messages (request_id, sender_id, body) values ('$R','$B','Saturday?')")"
check "Ben cannot change request status" "permission denied" "$(q $B "update requests set status='done' where id='$R'")"
check "Ben cannot accept his own request" "not allowed" "$(q $B "select respond_request('$R','{$BA}')")"
check "internal helper not callable" "permission denied" "$(q $B "select _sys('$R','sysDone')")"
check "Ana accepts" "accepted" "$(q $A "select respond_request('$R','{$BA}')")"
check "both books reserved" "reserved reserved" "$(q $A "select string_agg(status,' ') from books where id in ('$BA','$BB')")"
check "Cleo cannot schedule" "not allowed" "$(q $C "select schedule_handover('$R', current_date + 6, 'school')")"
check "Ben schedules handover" "" "$(q $B "select schedule_handover('$R', current_date + 6, 'Saturday at school')")"
check "Ana marks done" "" "$(q $A "select complete_request('$R')")"
check "both books gone" "gone gone" "$(q $A "select string_agg(status,' ') from books where id in ('$BA','$BB')")"
check "system messages recorded" "sysAccepted sysHandover sysDone" "$(q $A "select string_agg(sys_key,' ' order by id) from messages where kind='system'")"

echo "== photos (storage)"
check "Ben uploads into his folder" "INSERT 0 1" "$(q $B "insert into storage.objects (bucket_id, name) values ('book-photos','$G1/$B/2.jpg')")"
check "Ben cannot upload into Ana's folder" "row-level security" "$(q $B "insert into storage.objects (bucket_id, name) values ('book-photos','$G1/$A/x.jpg')")"
check "Cleo cannot upload into group 1" "row-level security" "$(q $C "insert into storage.objects (bucket_id, name) values ('book-photos','$G1/$C/x.jpg')")"
check "Ana can see group-1 photo" "1" "$(q $A "select count(*) from storage.objects where name='$G1/$B/2.jpg'")"
check "Cleo cannot see group-1 photo" "0" "$(q $C "select count(*) from storage.objects where name='$G1/$B/2.jpg'")"
check "Ana cannot delete Ben's photo" "DELETE 0" "$(q $A "delete from storage.objects where name='$G1/$B/2.jpg'")"

echo; echo "RESULT: $pass passed, $fail failed"
