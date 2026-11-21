#!/bin/bash
# Tests for migration 009 ("Books I got"). Builds a fresh local database: 001–003, 005, 009.
cd "$(dirname "$0")/../.."
run() { su postgres -c "psql -q -v ON_ERROR_STOP=1 $*" >/dev/null 2>&1 || { echo "setup failed: $*"; exit 1; }; }
run "-f supabase/tests/local_supabase_stub.sql"
for m in 001_init 002_reviews_avatars 003_notifications_admin 005_open_network; do run "-d bs -f supabase/migrations/$m.sql"; done
A=11111111-1111-1111-1111-111111111111; B=22222222-2222-2222-2222-222222222222; C=33333333-3333-3333-3333-333333333333
N=00000000-0000-0000-0000-000000000001
q() { local who=$1; shift; local role=authenticated; local sub=$who; [ "$who" = anon ] && role=anon && sub=''
  su postgres -c "psql -d bs -tA -v ON_ERROR_STOP=1 -c \"set role $role; set request.jwt.claim.sub = '$sub';\" -c \"$*\"" 2>&1 | grep -v '^SET$' | sed 's/^psql:.*ERROR: */ERROR: /' | tr '\n' ' ' | sed 's/ *$//'; echo; }
pass=0; fail=0
check() { if [[ "$3" == *"$2"* ]]; then pass=$((pass+1)); echo "  ok   $1"; else fail=$((fail+1)); echo "  FAIL $1  (expected '$2', got '$3')"; fi; }
su postgres -c "psql -d bs -q -c \"insert into auth.users values ('$A','ana@x.com'),('$B','ben@x.com'),('$C','cleo@x.com') on conflict do nothing;\""
q $A "select join_network('Ana','DK','2700','{lt}','v')" >/dev/null
q $B "select join_network('Ben','DK','2720','{en}','v')" >/dev/null
q $C "select join_network('Cleo','DK','2720','{en}','v')" >/dev/null

# An exchange finished before the migration: Ben buys Ana's 'Old' for 4 EUR.
BO=$(q $A "insert into books (group_id, owner_id, title, author, offer, price_cents, photo_paths) values ('$N','$A','Old','Ana Author','sell',400,'{$N/$A/0.jpg}') returning id" | awk '{print $1}')
R0=$(q $B "select create_request('$A','{$BO}','{}','Buy?')" | tr -d ' ')
q $A "select respond_request('$R0','{$BO}')" >/dev/null; q $B "select complete_request('$R0')" >/dev/null
run "-d bs -f supabase/migrations/009_received_books.sql"

echo "== backfill"
check "Ben's earlier purchase is in his list" "Old|bought|400" "$(q $B "select title, how, price_cents from received_books")"
check "Ana (the seller) gets no row for it" "0" "$(q $A "select count(*) from received_books")"
run "-d bs -f supabase/migrations/009_received_books.sql"
check "running 009 again does not duplicate" "1" "$(q $B "select count(*) from received_books")"

echo "== new exchanges"
BA=$(q $A "insert into books (group_id, owner_id, title, isbn, offer, photo_paths) values ('$N','$A','Zog','9786090110607','swap','{$N/$A/1.jpg}') returning id" | awk '{print $1}')
BB=$(q $B "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$B','Elmer','give','{$N/$B/1.jpg}') returning id" | awk '{print $1}')
R=$(q $B "select create_request('$A','{$BA}','{$BB}','Swap?')" | tr -d ' ')
q $A "select respond_request('$R','{$BA}')" >/dev/null
check "nothing is listed before the handover" "1" "$(q $B "select count(*) from received_books")"
q $A "select complete_request('$R')" >/dev/null
check "Ben (requester) got Zog as a swap" "Zog|swapped|9786090110607" "$(q $B "select title, how, isbn from received_books where title='Zog'")"
check "Ana (owner) got Elmer, offered in return" "Elmer|swapped" "$(q $A "select title, how from received_books")"

BG=$(q $C "insert into books (group_id, owner_id, title, offer, photo_paths) values ('$N','$C','Gruffalo','give','{$N/$C/1.jpg}') returning id" | awk '{print $1}')
RG=$(q $A "select create_request('$C','{$BG}','{}','May I?')" | tr -d ' ')
q $C "select respond_request('$RG','{$BG}')" >/dev/null; q $A "select complete_request('$RG')" >/dev/null
check "a free book shows as a gift" "Gruffalo|gift|0" "$(q $A "select title, how, price_cents from received_books where title='Gruffalo'")"

echo "== no details of the other member"
check "the table has no column pointing to the other member or the request" "0" \
  "$(su postgres -c "psql -d bs -tA -c \"select count(*) from information_schema.columns where table_name='received_books' and column_name in ('owner_id','from_id','giver_id','request_id','book_id','postal_code','display_name')\"")"
check "the list survives Ana deleting her gone listing" "2" "$(q $A "delete from books where id='$BA'" >/dev/null; q $B "select count(*) from received_books")"

echo "== only you see your list"
check "Cleo sees nothing" "0" "$(q $C "select count(*) from received_books")"
check "Ana cannot see Ben's rows" "0" "$(q $A "select count(*) from received_books where user_id='$B'")"
check "logged-out visitors are refused" "permission denied" "$(q anon "select count(*) from received_books")"
check "members cannot add rows" "permission denied" "$(q $B "insert into received_books (user_id, title, how) values ('$B','Fake','gift')")"
check "members cannot edit rows" "permission denied" "$(q $B "update received_books set title='x'")"
check "Ana cannot delete Ben's rows" "DELETE 0" "$(q $A "delete from received_books where user_id='$B'")"
check "Ben can remove a row from his list" "DELETE 1" "$(q $B "delete from received_books where title='Old'")"
check "members cannot call the helper" "permission denied" "$(q $B "select * from _received_rows('$R')")"
check "rows go with the account" "0" "$(su postgres -c "psql -d bs -tA -c \"delete from auth.users where id='$B'; select count(*) from received_books where user_id='$B'\"" | tail -1)"

echo; echo "RESULT: $pass passed, $fail failed"
[ $fail -eq 0 ]
