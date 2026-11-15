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

echo "== reviews and avatars"
R2=$(q $A "select r.id from requests r limit 1" | tr -d ' ')
check "Cleo cannot review" "not allowed" "$(q $C "select submit_review('$R','5','great')")"
check "Ben reviews Ana (5 books)" "" "$(q $B "select submit_review('$R',5,'Lovely swap!')")"
check "Ben edits his review (one per exchange)" "1" "$(q $B "select submit_review('$R',4,'Very nice'); select count(*) from reviews where reviewer_id='$B'" | awk '{print $NF}')"
check "rating out of range rejected" "1–5" "$(q $A "select submit_review('$R',9,'x')")"
check "Ana reviews Ben" "" "$(q $A "select submit_review('$R',5,'')")"
check "reviews readable in group" "2" "$(q $B "select count(*) from reviews")"
check "Cleo cannot read group-1 reviews" "0" "$(q $C "select count(*) from reviews")"
check "nobody can insert reviews directly" "permission denied" "$(q $B "insert into reviews (request_id, group_id, reviewer_id, reviewee_id, rating) values ('$R','$G1','$B','$A',1)")"
check "Ben cannot fake-edit Ana's review" "permission denied" "$(q $B "update reviews set rating=1")"
check "review comment blocks PDF links" "not allowed" "$(q $B "select submit_review('$R',3,'get it at libgen')")"
R3=$(q $B "select create_request('$A','{$(q $A "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$G1','$A','Gruffalo','swap','{x}') returning id" | awk '{print $1}')}','{}','hi')" | tr -d ' ')
check "no review before handover" "after the handover" "$(q $B "select submit_review('$R3',5,'')")"
check "Ben sets avatar in own folder" "UPDATE 1" "$(q $B "update members set avatar_path='$G1/$B/avatar.jpg' where user_id='$B'")"
check "Ben cannot point avatar at Ana's file" "violates check constraint" "$(q $B "update members set avatar_path='$G1/$A/x.jpg' where user_id='$B'")"
check "Ben cannot set Ana's avatar" "UPDATE 0" "$(q $B "update members set avatar_path='$G1/$A/a.jpg' where user_id='$A'")"

echo "== notifications"
check "Ana got 'request_new' for each of Ben's 2 requests" "2" "$(q $A "select count(*) from notifications where type='request_new'")"
check "Ben got 'request_answered'" "1" "$(q $B "select count(*) from notifications where type='request_answered'")"
check "Ben got 'review' from Ana" "1" "$(q $B "select count(*) from notifications where type='review'")"
check "Cleo sees no one else's notifications" "0" "$(q $C "select count(*) from notifications where user_id<>'$C'")"
check "Ben cannot mark Ana's notifications read" "UPDATE 0" "$(q $B "update notifications set read_at=now() where user_id='$A'")"
check "Ben can mark his own read" "UPDATE" "$(q $B "update notifications set read_at=now() where user_id='$B'")"
check "Ben cannot create notifications" "permission denied" "$(q $B "insert into notifications (user_id, type) values ('$A','announcement')")"
check "_notify not callable" "permission denied" "$(q $B "select _notify('$A','$G1','announcement','{}')")"
q $B "insert into messages (request_id, sender_id, body) values ('$R3','$B','one')" >/dev/null
q $B "insert into messages (request_id, sender_id, body) values ('$R3','$B','two')" >/dev/null
check "3 chat messages collapse into one unread notification" "1 3" "$(q $A "select count(*), max((data->>'count')::int) from notifications where type='message' and data->>'request_id'='$R3'" | tr '|' ' ')"
check "Ben sets his notification prefs" "INSERT 0 1" "$(q $B "insert into notification_prefs (user_id, app_types, email_types, email_mode, lang) values ('$B','{request_new}','{}','off','lt')")"
check "prefs reject unknown types" "violates check constraint" "$(q $B "update notification_prefs set app_types='{spam}' where user_id='$B'")"
check "Ben cannot write Ana's prefs" "row-level security" "$(q $B "insert into notification_prefs (user_id) values ('$A')")"
check "Ben cannot read Ana's prefs" "0" "$(q $B "select count(*) from notification_prefs where user_id='$A'")"
q $A "select submit_review('$R',2,'changed')" >/dev/null
check "muted type is not created (Ben muted reviews)" "1" "$(q $B "select count(*) from notifications where type='review'")"
WB=$(q $B "insert into wishes (group_id, owner_id, title) values ('$G1','$B','The Little Prince') returning id" | awk '{print $1}')
q $A "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$G1','$A','the little prince!','give','{x}')" >/dev/null
q $B "update notification_prefs set app_types=app_types||'{wish_match}' where user_id='$B'" >/dev/null
q $A "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$G1','$A','The Little Prince','give','{y}')" >/dev/null
check "wish match notifies Ben (title match ignores case/punctuation)" "1" "$(q $B "select count(*) from notifications where type='wish_match'")"
q $B "insert into wishes (group_id, owner_id, title) values ('$G1','$B','Gruffalo')" >/dev/null
check "new wish tells Ana she has it ('wanted')" "1" "$(q $A "select count(*) from notifications where type='wanted'")"

echo "== organiser tools"
check "Ben (member) cannot see stats" "only organisers" "$(q $B "select org_stats('$G1')")"
check "Ana sees stats" "members" "$(q $A "select org_stats('$G1')")"
check "Ben cannot promote himself" "only organisers" "$(q $B "select org_set_role('$G1','$B','organiser')")"
check "Ana cannot demote the last organiser (herself)" "at least one organiser" "$(q $A "select org_set_role('$G1','$A','member')")"
check "Ben cannot hide Ana's book" "only organisers" "$(q $B "select org_hide_book('$BA', true, 'x')")"
BX=$(q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$G1','$B','Spam book','give','{z}') returning id" | awk '{print $1}')
check "Ana hides Ben's listing" "" "$(q $A "select org_hide_book('$BX', true, 'spam')")"
check "Cleo/others no longer see hidden book" "0" "$(q $C "select count(*) from books where id='$BX'")"
check "owner still sees his hidden book" "1" "$(q $B "select count(*) from books where id='$BX'")"
check "Ben reports a chat (copyright)" "INSERT 0 1" "$(q $B "insert into reports (group_id, reporter_id, target_type, target_id, category, reason) values ('$G1','$B','request','$R','copyright','test')")"
check "Ana notified about the report" "1" "$(q $A "select count(*) from notifications where type='report_new'")"
RP=$(q $A "select id from reports order by id desc limit 1" | tr -d ' ')
check "Ana can read the reported chat" "Saturday" "$(q $A "select string_agg(body,' ') from org_report_context($RP)")"
check "Ben cannot read report context" "only organisers" "$(q $B "select * from org_report_context($RP)")"
check "Ben cannot resolve reports directly" "permission denied" "$(q $B "update reports set resolved_at=now()")"
check "Ana resolves the report" "" "$(q $A "select org_resolve_report($RP, 'Talked to both')")"
check "Ben cannot announce" "only organisers" "$(q $B "select org_announce('$G1','hi all')")"
check "Ana announces to everyone (2 members)" "2" "$(q $A "select org_announce('$G1','Swap day next Saturday!')")"
check "Ana received the announcement" "Swap day" "$(q $A "select data->>'text' from notifications where type='announcement'")"
check "Ben muted announcements, so got none" "0" "$(q $B "select count(*) from notifications where type='announcement'")"
check "Ben cannot list invites" "only organisers" "$(q $B "select * from org_invites('$G1')")"
INV=$(q $A "select id from org_invites('$G1') limit 1" | tr -d ' ')
check "Ana revokes an invite" "" "$(q $A "select org_revoke_invite('$INV')")"
check "moderation log is recorded" "hide_book" "$(q $A "select string_agg(action,' ') from moderation_log")"
check "Ben cannot read the moderation log" "0" "$(q $B "select count(*) from moderation_log")"
check "Ana removes and bans Ben" "" "$(q $A "select org_remove_member('$G1','$B','spam', true)")"
NEWCODE=$(q $A "select create_invite('$G1')" | tr -d ' ')
check "banned Ben cannot rejoin with a new code" "invalid or expired" "$(q $B "select join_group('$NEWCODE','Ben','DK','2720','{}','v')")"
check "Ben no longer sees group books" "0" "$(q $B "select count(*) from books where group_id='$G1'")"
check "Ana unbans Ben" "" "$(q $A "select org_unban('$G1','$B')")"
check "Ben can rejoin after unban" "$G1" "$(q $B "select join_group('$NEWCODE','Ben','DK','2720','{}','v')")"

echo "== platform admin"
check "normal user is not platform admin" "f" "$(q $A "select is_platform_admin()")"
check "normal user cannot see overview" "only platform admins" "$(q $A "select * from admin_overview()")"
su postgres -c "psql -d bs -q -c \"insert into platform_admins values ('$C') on conflict do nothing\""
check "platform admin sees all groups (2)" "2" "$(q $C "select count(*) from admin_overview()")"
check "platform admin sees open reports" "" "$(q $C "select count(*) from admin_reports()")"
check "users cannot make themselves platform admin" "permission denied" "$(q $A "insert into platform_admins values ('$A')")"
check "handover reminders run" "" "$(su postgres -c "psql -d bs -tA -c 'select send_handover_reminders()'")"

echo; echo "RESULT: $pass passed, $fail failed"
