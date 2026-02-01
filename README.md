# Amusent Park - Amusement Park Management


Setup

1. cd into project root
2. yarn install
3. cd server and run: yarn migrate && yarn seed
4. Start server: yarn workspace server dev
5. Start client: yarn workspace client dev

API
- POST /api/tickets - create ticket
- GET /api/tickets - list tickets
- GET /api/reports/daily?date=YYYY-MM-DD - daily report
- GET /api/activities - list activities
