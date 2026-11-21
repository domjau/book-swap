#!/bin/bash
# Runs every database test, each on a fresh local database. Needs root (the tests use `su postgres`).
#   sudo bash supabase/tests/run_all.sh
cd "$(dirname "$0")/../.."
build() { su postgres -c "psql -q -v ON_ERROR_STOP=1 -f supabase/tests/local_supabase_stub.sql" >/dev/null 2>&1 || { echo "stub failed"; exit 1; }
  for m in "$@"; do su postgres -c "psql -q -v ON_ERROR_STOP=1 -d bs -f supabase/migrations/$m.sql" >/dev/null 2>&1 || { echo "migration $m failed"; exit 1; }; done; }
status=0
run() { local name=$1; shift; local out; out=$(bash "$@" 2>&1); echo "$out" | grep "FAIL"; local last; last=$(echo "$out" | tail -1)
  echo "$name: $last"; [[ "$last" == *" 0 failed"* ]] || status=1; }
ALL="001_init 002_reviews_avatars 003_notifications_admin 005_open_network 006_isbn_lookup 007_privacy_safety"
build 001_init 002_reviews_avatars 003_notifications_admin;                  run "rls (001–003)" supabase/tests/rls_test.sh
build 001_init 002_reviews_avatars 003_notifications_admin 005_open_network; run "network (001–005)" supabase/tests/network_test.sh
build $ALL;                                                                  run "network (all migrations)" supabase/tests/network_test.sh
run "isbn lookup" supabase/tests/isbn_lookup_test.sh
run "privacy and safety" supabase/tests/privacy_safety_test.sh
exit $status
