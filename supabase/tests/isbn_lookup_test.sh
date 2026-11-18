#!/bin/bash
# Tests for migration 006 (isbn-lookup cache and fair-use quota). Builds a fresh local database: 001–003, 005, 006.
cd "$(dirname "$0")/../.."
run() { su postgres -c "psql -q -v ON_ERROR_STOP=1 $*" >/dev/null 2>&1 || { echo "setup failed: $*"; exit 1; }; }
run "-f supabase/tests/local_supabase_stub.sql"
for m in 001_init 002_reviews_avatars 003_notifications_admin 005_open_network 006_isbn_lookup; do run "-d bs -f supabase/migrations/$m.sql"; done
A=11111111-1111-1111-1111-111111111111; B=22222222-2222-2222-2222-222222222222
q() { local role=$1; shift; local sub=''; [ "$role" = authenticated ] && sub=$A
  su postgres -c "psql -d bs -tA -c \"set role $role; set request.jwt.claim.sub = '$sub';\" -c \"$*\"" 2>&1 | grep -v '^SET$' | sed 's/^psql:.*ERROR: */ERROR: /' | tr '\n' ' ' | sed 's/ *$//'; echo; }
pass=0; fail=0
check() { if [[ "$3" == *"$2"* ]]; then pass=$((pass+1)); echo "  ok   $1"; else fail=$((fail+1)); echo "  FAIL $1  (expected '$2', got '$3')"; fi; }

echo "== members and visitors cannot touch the cache or log"
check "member cannot read the cache" "permission denied" "$(q authenticated "select count(*) from isbn_lookup_cache")"
check "member cannot write the cache" "permission denied" "$(q authenticated "insert into isbn_lookup_cache (isbn13, found) values ('9786094170928', false)")"
check "visitor cannot read the cache" "permission denied" "$(q anon "select count(*) from isbn_lookup_cache")"
check "member cannot read the log" "permission denied" "$(q authenticated "select count(*) from isbn_lookup_log")"
check "member cannot take quota (would skip the function)" "permission denied" "$(q authenticated "select isbn_lookup_take_quota('$A')")"
check "visitor cannot take quota" "permission denied" "$(q anon "select isbn_lookup_take_quota('$A')")"

echo "== the Edge Function (service_role)"
check "can cache a hit" "INSERT 0 1" "$(q service_role "insert into isbn_lookup_cache (isbn13, found, data) values ('9786094170928', true, '{\\\"title\\\":\\\"x\\\"}')")"
check "can cache a miss" "INSERT 0 1" "$(q service_role "insert into isbn_lookup_cache (isbn13, found) values ('9786090110607', false)")"
check "only clean ISBN-13s are stored" "violates check constraint" "$(q service_role "insert into isbn_lookup_cache (isbn13, found) values ('978-609-417-092-8', false)")"
check "first call is allowed" "t" "$(q service_role "select isbn_lookup_take_quota('$A', 2, 3)")"
check "second call is allowed" "t" "$(q service_role "select isbn_lookup_take_quota('$A', 2, 3)")"
check "third call in the hour is refused (per person)" "f" "$(q service_role "select isbn_lookup_take_quota('$A', 2, 3)")"
check "another member still gets one" "t" "$(q service_role "select isbn_lookup_take_quota('$B', 2, 3)")"
check "then the app-wide limit stops everyone" "f" "$(q service_role "select isbn_lookup_take_quota('$B', 2, 3)")"
check "no user → refused" "f" "$(q service_role "select isbn_lookup_take_quota(null)")"
su postgres -c "psql -d bs -q -c \"update isbn_lookup_log set at = now() - interval '2 days'\""
check "old log rows are pruned" "0" "$(q service_role "select isbn_lookup_take_quota('$A', 2, 3); select count(*) from isbn_lookup_log where at < now() - interval '1 day'")"

echo; echo "RESULT: $pass passed, $fail failed"
[ $fail -eq 0 ]
