#!/bin/bash
# Tests for migration 010 (Portuguese blocked words). Builds a fresh local database: 001–003, 005–007, 010.
cd "$(dirname "$0")/../.."
run() { su postgres -c "psql -q -v ON_ERROR_STOP=1 $*" >/dev/null 2>&1 || { echo "setup failed: $*"; exit 1; }; }
run "-f supabase/tests/local_supabase_stub.sql"
for m in 001_init 002_reviews_avatars 003_notifications_admin 005_open_network 006_isbn_lookup 007_privacy_safety 010_blocked_words_pt; do run "-d bs -f supabase/migrations/$m.sql"; done
q() { su postgres -c "psql -d bs -tA -c \"$*\"" 2>&1 | tr -d '\n'; }
pass=0; fail=0
check() { if [[ "$3" == "$2" ]]; then pass=$((pass+1)); echo "  ok   $1"; else fail=$((fail+1)); echo "  FAIL $1  (expected '$2', got '$3')"; fi; }

echo "== Portuguese swear words are blocked"
check "caralho" "t" "$(q "select has_blocked_term('Que caralhos é isto')")"
check "foda-se" "t" "$(q "select has_blocked_term('Foda-se, que livro')")"
check "merda" "t" "$(q "select has_blocked_term('isto é uma MERDA')")"
check "cabrão with accent" "t" "$(q "select has_blocked_term('seu cabrão')")"
echo "== normal Portuguese is not"
check "a children's book title" "f" "$(q "select has_blocked_term('O Principezinho – a raposa e a rosa')")"
check "bicha (queue) is allowed" "f" "$(q "select has_blocked_term('Havia uma bicha enorme na escola')")"
check "Conan is not cona" "f" "$(q "select has_blocked_term('Conan, o bárbaro')")"
check "running it twice is fine" "0" "$(su postgres -c "psql -q -d bs -v ON_ERROR_STOP=1 -f supabase/migrations/010_blocked_words_pt.sql" >/dev/null 2>&1; echo $?)"

echo
echo "RESULT: $pass passed, $fail failed"
[ $fail -eq 0 ]
