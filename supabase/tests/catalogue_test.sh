#!/bin/bash
# Tests for migration 008 (shared catalogue). Builds a fresh local database: 001–003, 005–008.
cd "$(dirname "$0")/../.."
run() { su postgres -c "psql -q -v ON_ERROR_STOP=1 $*" >/dev/null 2>&1 || { echo "setup failed: $*"; exit 1; }; }
run "-f supabase/tests/local_supabase_stub.sql"
for m in 001_init 002_reviews_avatars 003_notifications_admin 005_open_network 006_isbn_lookup 007_privacy_safety 008_catalogue; do run "-d bs -f supabase/migrations/$m.sql"; done
A=11111111-1111-1111-1111-111111111111; B=22222222-2222-2222-2222-222222222222; D=44444444-4444-4444-4444-444444444444; N=00000000-0000-0000-0000-000000000001
q() { local who=$1; shift; local role=authenticated; local sub=$who; [ "$who" = anon ] && role=anon && sub=''
  su postgres -c "psql -d bs -tA -v ON_ERROR_STOP=1 -c \"set role $role; set request.jwt.claim.sub = '$sub';\" -c \"$*\"" 2>&1 | grep -v '^SET$' | sed 's/^psql:.*ERROR: */ERROR: /' | tr '\n' ' ' | sed 's/ *$//'; echo; }
pass=0; fail=0
check() { if [[ "$3" == *"$2"* ]]; then pass=$((pass+1)); echo "  ok   $1"; else fail=$((fail+1)); echo "  FAIL $1  (expected '$2', got '$3')"; fi; }
su postgres -c "psql -d bs -q -c \"insert into auth.users values ('$A','ana@x.com'),('$B','ben@x.com'),('$D','dan@x.com')\""
q $A "select join_network('Ana','DK','2700','{lt}','v')" >/dev/null; q $B "select join_network('Ben','DK','2700','{lt}','v')" >/dev/null

echo "== typed-in books are saved per ISBN"
BA=$(q $A "insert into books (group_id, owner_id, isbn, title, author, description, lang, topics, age, offer, photo_paths) values ('$N','$A','9786090110607','Pavogtas Pilkutis','Holly Webb','Apie kačiuką','lt','{animals}','7–9','swap','{x}') returning id" | awk '{print $1}')
check "Ben finds Ana's typed-in details" "Pavogtas Pilkutis|Holly Webb|lt|7–9" "$(q $B "select title||'|'||author||'|'||lang||'|'||age from catalogue where isbn13='9786090110607'")"
check "no member id or photos in the catalogue" "f" "$(q $B "select exists (select 1 from information_schema.columns where table_name='catalogue' and column_name in ('owner_id','photo_paths','user_id'))")"
q $A "delete from books where id='$BA'" >/dev/null
check "still there after the listing is removed" "1" "$(q $B "select count(*) from catalogue where isbn13='9786090110607'")"
q $B "insert into books (group_id, owner_id, isbn, title, offer, photo_paths) values ('$N','$B','9786090110607','Pavogtas Pilkutis (2 leid.)','swap','{x}')" >/dev/null
check "a second listing updates the title but keeps the filled author" "Pavogtas Pilkutis (2 leid.)|Holly Webb|2" "$(q $B "select title||'|'||author||'|'||listings from catalogue where isbn13='9786090110607'")"
check "books without an ISBN are not saved" "1" "$(q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$B','No isbn','swap','{x}')" >/dev/null; q $B "select count(*) from catalogue")"

echo "== only the trigger writes it"
check "members cannot write the catalogue" "permission denied" "$(q $B "insert into catalogue (isbn13, title) values ('9780000000002','x')")"
check "members cannot change it" "permission denied" "$(q $B "update catalogue set title='x'")"
check "visitors cannot read it" "permission denied" "$(q anon "select count(*) from catalogue")"
check "signed in but not joined: sees nothing" "0" "$(q $D "select count(*) from catalogue")"
check "blocked words never reach it" "text not allowed" "$(q $B "insert into books (group_id, owner_id, isbn, title, offer, photo_paths) values ('$N','$B','9780140328721','Shit book','swap','{x}')")"

echo
echo "RESULT: $pass passed, $fail failed"
[ $fail -eq 0 ]
