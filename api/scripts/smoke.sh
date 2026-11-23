#!/usr/bin/env bash
set -euo pipefail
BASE="${API_BASE:-http://localhost:3000/api/v1}"

echo "== health"
curl -sf "$BASE/health"

echo ""
echo "== staff login admin"
STAFF_TOKEN=$(curl -sf -X POST "$BASE/auth/staff/login" \
  -H 'Content-Type: application/json' \
  -d '{"dialCode":"852","phone":"88888888","password":"admin1234"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

echo "staff token ok (${#STAFF_TOKEN} chars)"

echo "== signup member"
curl -sf -X POST "$BASE/auth/signup" \
  -H 'Content-Type: application/json' \
  -d '{
    "dialCode":"852","phone":"90000001","password":"memberpass1",
    "surname":"Chan","givenName":"Tai","dateOfBirth":"1990-05-01",
    "gender":"male","email":"tai@example.com"
  }' > /dev/null

MEMBER_TOKEN=$(curl -sf -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"dialCode":"852","phone":"90000001","password":"memberpass1"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

echo "== member cannot use staff settings"
curl -sf -X PATCH "$BASE/settings" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"guestBookingEnabled":false}' && exit 1 || echo "403 expected"

DATE=$(date -u -d '+3 days' +%Y-%m-%d 2>/dev/null || date -u -v+3d +%Y-%m-%d)

echo "== guest booking"
curl -sf -X POST "$BASE/bookings" \
  -H 'Content-Type: application/json' \
  -d "{\"date\":\"$DATE\",\"time\":\"11:00\",\"courtId\":2,\"guestName\":\"Smoke Guest\"}" > /dev/null

echo "== member booking + mine only"
curl -sf -X POST "$BASE/bookings" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"date\":\"$DATE\",\"time\":\"13:00\",\"courtId\":4}" > /dev/null

MINE=$(curl -sf "$BASE/bookings/mine" -H "Authorization: Bearer $MEMBER_TOKEN")
echo "$MINE" | grep -q courtId

echo "== staff cannot create bookings (member body)"
curl -sf -X POST "$BASE/bookings" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"date\":\"$DATE\",\"time\":\"15:00\",\"courtId\":6}" && exit 1 || echo "403 expected"

echo "== staff cannot create guest bookings"
curl -sf -X POST "$BASE/bookings" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"date\":\"$DATE\",\"time\":\"16:00\",\"courtId\":7,\"guestName\":\"Should Fail\"}" && exit 1 || echo "403 expected"

echo "== disable guest booking (staff)"
curl -sf -X PATCH "$BASE/settings" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"guestBookingEnabled":false}' > /dev/null

echo "== all smoke checks passed"