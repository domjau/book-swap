#!/bin/bash
# Tests for migration 007 (privacy and safety). Builds a fresh local database: 001–003, 005, 006, 007.
# Users: Ana (admin), Ben, Cleo, Dan, Eve (all members of the open network).
cd "$(dirname "$0")/../.."
run() { su postgres -c "psql -q -v ON_ERROR_STOP=1 $*" >/dev/null 2>&1 || { echo "setup failed: $*"; exit 1; }; }
run "-f supabase/tests/local_supabase_stub.sql"
for m in 001_init 002_reviews_avatars 003_notifications_admin 005_open_network 006_isbn_lookup 007_privacy_safety; do run "-d bs -f supabase/migrations/$m.sql"; done
A=11111111-1111-1111-1111-111111111111; B=22222222-2222-2222-2222-222222222222; C=33333333-3333-3333-3333-333333333333
D=44444444-4444-4444-4444-444444444444; E=55555555-5555-5555-5555-555555555555; N=00000000-0000-0000-0000-000000000001
q() { local who=$1; shift; local role=authenticated; local sub=$who; [ "$who" = anon ] && role=anon && sub=''
  su postgres -c "psql -d bs -tA -v ON_ERROR_STOP=1 -c \"set role $role; set request.jwt.claim.sub = '$sub';\" -c \"$*\"" 2>&1 | grep -v '^SET$' | sed 's/^psql:.*ERROR: */ERROR: /' | tr '\n' ' ' | sed 's/ *$//'; echo; }
sql() { su postgres -c "psql -d bs -tA -v ON_ERROR_STOP=1 -c \"$*\"" 2>&1 | tr '\n' ' ' | sed 's/ *$//'; echo; }
pass=0; fail=0
check() { if [[ "$3" == *"$2"* ]]; then pass=$((pass+1)); echo "  ok   $1"; else fail=$((fail+1)); echo "  FAIL $1  (expected '$2', got '$3')"; fi; }
sql "insert into auth.users values ('$A','ana@x.com'),('$B','ben@x.com'),('$C','cleo@x.com'),('$D','dan@x.com'),('$E','eve@x.com'); insert into platform_admins values ('$A');" >/dev/null
for u in "$A Ana" "$B Ben" "$C Cleo" "$D Dan" "$E Eve"; do set -- $u; q $1 "select join_network('$2','DK','2700','{lt}','v')" >/dev/null; done
book() { q $1 "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$1','$2','swap','{$N/$1/1.jpg}') returning id" | awk '{print $1}'; }

echo "== names that pose as admins"
check "Ben cannot call himself 'Admin'" "name not allowed" "$(q $B "update members set display_name='Admin Ben' where user_id='$B'")"
check "nor 'seku seku support'" "name not allowed" "$(q $B "update members set display_name='seku-seku Support' where user_id='$B'")"
check "nor 'Moderatorius' (LT)" "name not allowed" "$(q $B "update members set display_name='Moderatorius' where user_id='$B'")"
check "a new member cannot sign up as 'Administrador'" "name not allowed" "$(sql "insert into auth.users values ('66666666-6666-6666-6666-666666666666','f@x.com')" >/dev/null; q 66666666-6666-6666-6666-666666666666 "select join_network('Administrador','ES','28013','{es}','v')")"
check "an ordinary name is fine" "UPDATE 1" "$(q $B "update members set display_name='Ben B.' where user_id='$B'")"
check "a real admin may use it" "UPDATE 1" "$(q $A "update members set display_name='Ana (admin)' where user_id='$A'")"

echo "== blocked words"
check "book title with a swear word refused" "text not allowed" "$(q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$B','Fucking great','swap','{x}')")"
check "Lithuanian swear word in a description refused" "text not allowed" "$(q $B "insert into books (group_id, owner_id, title, description, offer, photo_paths) values ('$N','$B','Knyga','tikra kurva','swap','{x}')")"
check "Spanish one in a wish refused" "text not allowed" "$(q $B "insert into wishes (group_id, owner_id, title) values ('$N','$B','Mierda')")"
check "prefix words caught inside punctuation" "text not allowed" "$(q $B "insert into wishes (group_id, owner_id, title) values ('$N','$B','x...porno!')")"
check "no false alarm inside other words (Scunthorpe, shitake)" "INSERT 0 1" "$(q $B "insert into wishes (group_id, owner_id, title) values ('$N','$B','Scunthorpe shitake mushrooms')")"
check "rude display name refused" "text not allowed" "$(q $B "update members set display_name='bitch' where user_id='$B'")"
BB=$(book $B "Elmer"); BC=$(book $C "Zog")
R=$(q $C "select create_request('$B','{$BB}','{}','hi')" | tr -d ' ')
check "swear word in chat refused" "text not allowed" "$(q $C "insert into messages (request_id, sender_id, kind, body) values ('$R','$C','user','you cunt')")"
check "normal chat message still fine" "INSERT 0 1" "$(q $C "insert into messages (request_id, sender_id, kind, body) values ('$R','$C','user','Saturday at the school?')")"

echo "== statement of reasons"
q $A "select org_hide_book('$BB', true, 'Photo shows a child')" >/dev/null
check "owner told the listing was hidden, with the reason" "hide_book|Photo shows a child|false" "$(q $B "select data->>'action', data->>'reason', data->>'automatic' from notifications where type='moderation'")"
check "other members don't see it" "0" "$(q $C "select count(*) from notifications where type='moderation'")"
check "unhiding is told too" "unhide_book" "$(q $A "select org_hide_book('$BB', false, 'Fixed')" >/dev/null; q $B "select string_agg(data->>'action', ',') from notifications where type='moderation'")"
q $A "select org_remove_member('$N', '$E', 'Spam listings', true)" >/dev/null
check "removed member told why (even after removal)" "remove_and_ban|Spam listings" "$(q $E "select data->>'action', data->>'reason' from notifications where type='moderation'")"
check "statement ignores notification settings" "1" "$(q $D "insert into notification_prefs (user_id, app_types, email_types, email_mode) values ('$D','{}','{}','off')" >/dev/null; q $A "select org_remove_member('$N', '$D', 'Test', false)" >/dev/null; q $D "select count(*) from notifications where type='moderation'")"
q $D "select join_network('Dan','DK','2700','{lt}','v')" >/dev/null
check "members cannot call the statement helper" "permission denied" "$(q $B "select _statement('$C','hide_book','x','x','x',false)")"

echo "== auto-hide after 3 reports"
BD=$(book $D "Gruffalo")
q $B "insert into reports (group_id, reporter_id, target_type, target_id, category) values ('$N','$B','book','$BD','inappropriate')" >/dev/null
q $B "insert into reports (group_id, reporter_id, target_type, target_id, category) values ('$N','$B','book','$BD','inappropriate')" >/dev/null
q $C "insert into reports (group_id, reporter_id, target_type, target_id, category) values ('$N','$C','book','$BD','spam')" >/dev/null
check "2 people (3 reports) don't hide it" "f" "$(sql "select hidden from books where id='$BD'")"
q $A "insert into reports (group_id, reporter_id, target_type, target_id, category) values ('$N','$A','book','$BD','spam')" >/dev/null
check "the 3rd person hides it" "t" "$(sql "select hidden from books where id='$BD'")"
check "owner told it was automatic" "auto_hide_book|true" "$(q $D "select data->>'action', data->>'automatic' from notifications where type='moderation' and data->>'action'='auto_hide_book'")"
check "it is in the moderation log" "auto_hide_book" "$(q $A "select action from moderation_log where action='auto_hide_book'")"
check "others no longer see it" "0" "$(q $C "select count(*) from books where id='$BD'")"

echo "== daily limits for new accounts"
for i in 1 2 3 4; do q $C "select create_request('$D','{$(book $D "D$i")}','{}','')" >/dev/null; done
check "5th request today still allowed" "" "$(q $C "select create_request('$B','{$(book $B "B5")}','{}','')" | grep -o ERROR)"
check "6th request today refused for a new account" "daily limit reached" "$(q $C "select create_request('$B','{$(book $B "B6")}','{}','')")"
sql "update members set joined_at = now() - interval '30 days' where user_id = '$C'" >/dev/null
check "older accounts get more" "" "$(q $C "select create_request('$B','{$(book $B "B7")}','{}','')" | grep -o ERROR)"
check "admins have no limit" "INSERT 0 1" "$(sql "update members set joined_at = now() where user_id='$A'" >/dev/null; for i in $(seq 1 40); do q $A "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$A','A$i','swap','{x}')" >/dev/null; done; q $A "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$A','A41','swap','{x}')")"
check "41st book in a day refused for a new account" "daily limit reached" "$(for i in $(seq 1 39); do q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$B','b$i','swap','{x}')" >/dev/null; done; q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$B','b40','swap','{x}')")"

echo "== download my data"
check "visitors cannot export" "permission denied" "$(q anon "select export_my_data()")"
check "export has my email, books and chats" "ben@x.com|t|t" "$(q $B "select export_my_data()->'account'->>'email', jsonb_array_length(export_my_data()->'books') > 0, jsonb_array_length(export_my_data()->'requests') > 0")"
check "export has no one else's books" "0" "$(q $B "select count(*) from jsonb_array_elements(export_my_data()->'books') b where b->>'owner_id' <> '$B'")"
check "reports I made are in it" "1" "$(q $C "select jsonb_array_length(export_my_data()->'reports_made')")"

echo "== delete my account"
check "the last admin cannot delete the account" "add another admin" "$(q $A "select delete_my_account()")"
check "visitors cannot call it" "permission denied" "$(q anon "select delete_my_account()")"
q $C "select delete_my_account()" >/dev/null
check "Cleo's account is gone" "0" "$(sql "select count(*) from auth.users where id='$C'")"
check "with her profile, books, requests and reports" "0|0|0|0" "$(sql "select (select count(*) from members where user_id='$C')||'|'||(select count(*) from books where owner_id='$C')||'|'||(select count(*) from requests where '$C' in (requester_id, owner_id))||'|'||(select count(*) from reports where reporter_id='$C')")"
check "the deletion is logged without the id" "account_deleted|" "$(sql "select action||'|'||target from moderation_log where action='account_deleted'")"
q $E "select delete_my_account()" >/dev/null
sql "insert into auth.users values ('77777777-7777-7777-7777-777777777777','EVE@x.com')" >/dev/null
check "a blocked member who deletes and comes back is still blocked" "has been blocked" "$(q 77777777-7777-7777-7777-777777777777 "select join_network('Eve2','DK','2700','{}','v')")"
check "banned emails are stored only as a hash" "f" "$(sql "select exists (select 1 from banned_emails where email_hash like '%@%')")"
check "members cannot read the banned list" "permission denied" "$(q $B "select count(*) from banned_emails")"
check "members cannot read the word list" "permission denied" "$(q $B "select count(*) from blocked_terms")"

echo "== automatic clean-up"
check "members cannot run the clean-up" "permission denied" "$(q $B "select cleanup_old_data()")"
sql "update notifications set read_at = now(), created_at = now() - interval '100 days' where user_id = '$B'; update books set created_at = now() - interval '2 days' where owner_id = '$B'" >/dev/null
RN=$(q $D "select create_request('$B','{$(book $B "New")}','{}','recent chat')" | tr -d ' ')
RB=$(q $D "select create_request('$B','{$(book $B "Old")}','{}','old chat')" | tr -d ' ')
sql "update requests set status='done', updated_at = now() - interval '13 months' where id = '$RB'; insert into reviews (request_id, group_id, reviewer_id, reviewee_id, rating) values ('$RB','$N','$D','$B',5)" >/dev/null
RP=$(q $D "select create_request('$B','{$(book $B "Stale")}','{}','')" | tr -d ' ')
sql "update requests set updated_at = now() - interval '7 months' where id = '$RP'" >/dev/null
OUT=$(sql "select cleanup_old_data()")
check "clean-up reports what it removed" "notifications" "$OUT"
check "old read notifications are gone" "0" "$(q $B "select count(*) from notifications where read_at is not null")"
check "chat of an old finished swap is gone" "0" "$(sql "select count(*) from messages where request_id='$RB'")"
check "but the swap and its review stay" "1|1" "$(sql "select (select count(*) from requests where id='$RB')||'|'||(select count(*) from reviews where request_id='$RB')")"
check "unanswered request after 6 months is gone" "0" "$(sql "select count(*) from requests where id='$RP'")"
check "recent chats stay" "t" "$(sql "select count(*) > 0 from messages where request_id='$RN'")"

echo
echo "RESULT: $pass passed, $fail failed"
[ $fail -eq 0 ]
