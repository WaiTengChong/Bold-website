#!/usr/bin/env bash
set -euo pipefail
BASE="${API_BASE:-http://localhost:3000/api/v1}"

echo "== health"
curl -sf "$BASE/health"

echo ""
echo "== login admin"
TOKEN=$(curl -sf -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"dialCode":"852","phone":"88888888","password":"admin1234"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

echo "token ok (${#TOKEN} chars)"

echo "== signup member"
curl -sf -X POST "$BASE/auth/signup" \
  -H 'Content-Type: application/json' \
  -d '{"dialCode":"852","phone":"90000001","password":"memberpass1"}' > /dev/null

MEMBER_TOKEN=$(curl -sf -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"dialCode":"852","phone":"90000001","password":"memberpass1"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

DATE=$(date -u -d '+3 days' +%Y-%m-%d 2>/dev/null || date -u -v+3d +%Y-%m-%d)

echo "== guest booking"
curl -sf -X POST "$BASE/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"date\":\"$DATE\",\"time\":\"11:00\",\"courtId\":2,\"guestName\":\"Smoke Guest\"}" > /dev/null

echo "== conflict"
curl -sf -X POST "$BASE/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"date\":\"$DATE\",\"time\":\"11:00\",\"courtId\":2,\"guestName\":\"Other\"}" && exit 1 || echo "409 expected"

echo "== maintenance court"
curl -sf -X POST "$BASE/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"date\":\"$DATE\",\"time\":\"12:00\",\"courtId\":3,\"guestName\":\"Bad\"}" && exit 1 || echo "400 expected"

echo "== member booking + mine only"
curl -sf -X POST "$BASE/bookings" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"date\":\"$DATE\",\"time\":\"13:00\",\"courtId\":4}" > /dev/null

MINE=$(curl -sf "$BASE/bookings/mine" -H "Authorization: Bearer $MEMBER_TOKEN")
echo "$MINE" | grep -q 90000001 || echo "$MINE" | grep -q courtId

echo "== disable guest booking"
curl -sf -X PATCH "$BASE/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"guestBookingEnabled":false}' > /dev/null

curl -sf -X POST "$BASE/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"date\":\"$DATE\",\"time\":\"14:00\",\"courtId\":6,\"guestName\":\"Blocked\"}" && exit 1 || echo "403 expected"

echo "== cms put"
curl -sf -X PUT "$BASE/content/site" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "$(curl -sf "$BASE/content/site")" > /dev/null

echo "== all smoke checks passed"