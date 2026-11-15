#!/bin/bash
# Security tests for the open network (migrations 001–005). Users: Ana (admin), Ben, Cleo, Dan.
A=11111111-1111-1111-1111-111111111111; B=22222222-2222-2222-2222-222222222222; C=33333333-3333-3333-3333-333333333333; D=44444444-4444-4444-4444-444444444444
N=00000000-0000-0000-0000-000000000001
q() { local who=$1; shift; local role=authenticated; local sub=$who; [ "$who" = anon ] && role=anon && sub=''
  su postgres -c "psql -d bs -tA -v ON_ERROR_STOP=1 -c \"set role $role; set request.jwt.claim.sub = '$sub';\" -c \"$*\"" 2>&1 | grep -v '^SET$' | sed 's/^psql:.*ERROR: */ERROR: /' | tr '\n' ' ' | sed 's/ *$//'; echo; }
pass=0; fail=0
check() { local name=$1 expect=$2 got=$3
  if [[ "$got" == *"$expect"* ]]; then pass=$((pass+1)); echo "  ok   $name"; else fail=$((fail+1)); echo "  FAIL $name  (expected '$expect', got '$got')"; fi; }
su postgres -c "psql -d bs -q -c \"insert into auth.users values ('$A','ana@x.com'),('$B','ben@x.com'),('$C','cleo@x.com'),('$D','dan@x.com') on conflict do nothing; insert into platform_admins values ('$A') on conflict do nothing;\""

echo "== sign-up (open)"
check "Ana joins the network" "$N" "$(q $A "select join_network('Ana','DK','2700','{lt}','v')")"
check "Ben joins without any code" "$N" "$(q $B "select join_network('Ben','DK','2720','{en}','v')")"
check "Cleo joins (Spain)" "$N" "$(q $C "select join_network('Cleo','ES','28013','{es}','v')")"
check "logged-out user cannot join" "permission denied" "$(q anon "select join_network('X','DK','2700','{}','v')")"
check "old invite-code joining is switched off" "permission denied" "$(q $D "select join_group('ABCDEFGH','Dan','DK','2700','{}','v')")"
check "creating communities is switched off" "permission denied" "$(q $D "select create_group('G','Dan','DK','2700','{}','v')")"
check "only one network exists" "1" "$(q $A "select count(*) from groups")"
check "Ana got 'member_joined' as admin" "2" "$(q $A "select count(*) from notifications where type='member_joined'")"
check "Ben (not admin) got no member_joined" "0" "$(q $B "select count(*) from notifications where type='member_joined'")"

echo "== books are visible to everyone signed in"
BA=$(q $A "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$A','Zog','swap','{$N/$A/1.jpg}') returning id" | awk '{print $1}')
BB=$(q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$B','Elmer','give','{$N/$B/1.jpg}') returning id" | awk '{print $1}')
check "Cleo (Spain) sees both books" "2" "$(q $C "select count(*) from books")"
check "logged-out visitors see nothing" "permission denied" "$(q anon "select count(*) from books")"
check "Dan (signed in, not joined) sees nothing" "0" "$(q $D "select count(*) from books")"
check "Ben cannot edit Ana's book" "UPDATE 0" "$(q $B "update books set title='x' where id='$BA'")"
check "Ben cannot list a book as Ana" "row-level security" "$(q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$A','x','swap','{x}')")"

echo "== chats stay private between two people"
R=$(q $B "select create_request('$A','{$BA}','{$BB}','Swap?')" | tr -d ' ')
check "Ana sees the request" "1" "$(q $A "select count(*) from requests")"
check "Cleo cannot see it" "0" "$(q $C "select count(*) from requests")"
check "Cleo cannot read the chat" "0" "$(q $C "select count(*) from messages")"
check "Cleo cannot write into it" "row-level security" "$(q $C "insert into messages (request_id, sender_id, body) values ('$R','$C','hi')")"

echo "== admin powers"
check "Ben is not admin" "f" "$(q $B "select is_platform_admin()")"
check "Ben cannot see stats" "only organisers" "$(q $B "select org_stats('$N')")"
check "Ana (admin) sees stats" "members" "$(q $A "select org_stats('$N')")"
check "Ben cannot hide books" "only organisers" "$(q $B "select org_hide_book('$BA', true, 'x')")"
check "Ben reports Cleo" "INSERT 0 1" "$(q $B "insert into reports (group_id, reporter_id, target_type, target_id, category) values ('$N','$B','member','$C','spam')")"
check "admin Ana notified of report" "1" "$(q $A "select count(*) from notifications where type='report_new'")"
check "Ben cannot read reports" "0" "$(q $B "select count(*) from reports")"
check "Ana reads reports" "1" "$(q $A "select count(*) from reports")"
q $B "insert into reports (group_id, reporter_id, target_type, target_id, category) values ('$N','$B','request','$R','other')" >/dev/null
RP=$(q $A "select id from reports where target_type='request'" | tr -d ' ')
check "admin can read a reported chat" "Swap?" "$(q $A "select string_agg(body,' ') from org_report_context($RP)")"
check "Ana announces to everyone (3 members)" "3" "$(q $A "select org_announce('$N','Welcome!')")"
check "Ben cannot announce" "only organisers" "$(q $B "select org_announce('$N','spam')")"
check "Ana removes and blocks Cleo" "" "$(q $A "select org_remove_member('$N','$C','spam', true)")"
check "blocked Cleo cannot sign up again" "blocked" "$(q $C "select join_network('Cleo2','ES','28013','{}','v')")"
check "Ana unblocks Cleo" "" "$(q $A "select org_unban('$N','$C')")"
check "Cleo can join again" "$N" "$(q $C "select join_network('Cleo','ES','28013','{}','v')")"
check "role changes are switched off" "permission denied" "$(q $A "select org_set_role('$N','$B','organiser')")"

echo "== managing admins"
check "Ben cannot list admins" "only platform admins" "$(q $B "select * from admin_list()")"
check "Ben cannot make himself admin" "only platform admins" "$(q $B "select admin_add('ben@x.com')")"
check "Ben cannot insert into platform_admins" "permission denied" "$(q $B "insert into platform_admins values ('$B')")"
check "Ana adds Ben by email" "" "$(q $A "select admin_add('Ben@X.com ')")"
check "admin list shows 2 with emails" "2" "$(q $A "select count(*) from admin_list() where email like '%@x.com'")"
check "Ben is now admin" "t" "$(q $B "select is_platform_admin()")"
check "adding unknown email explains" "sign up first" "$(q $A "select admin_add('nobody@x.com')")"
check "Ben removes Ana" "" "$(q $B "select admin_remove('$A')")"
check "last admin cannot be removed" "at least one admin" "$(q $B "select admin_remove('$B')")"
check "Ana is no longer admin" "f" "$(q $A "select is_platform_admin()")"
check "admin changes are logged" "add_admin" "$(q $B "select string_agg(action,' ') from moderation_log")"

echo "== notifications still private"
check "Ben cannot read Ana's notifications" "0" "$(q $B "select count(*) from notifications where user_id='$A'")"

echo; echo "RESULT: $pass passed, $fail failed"
