# ExploreWings API (NestJS)

NestJS backend serving the ExploreWings frontend from a Neon Postgres database.

## Base path

All endpoints are served under `rest/v1` for the frontend API client:

```
GET /rest/v1/resorts?page=1&limit=12&q=munnar
GET /rest/v1/resorts/:id
GET /rest/v1/tour_packages?category=Kerala|International|NorthEast
GET /rest/v1/tour_packages/:id?category=Kerala
```

Resort listing is paginated and searchable **server-side**:

- `page` (default `1`), `limit` (default `12`, max `60`), `q` searches
  `location` and `description` case-insensitively.
- Response: `{ items, total, page, limit, totalPages }`.
- List responses include only `image1`; `GET /resorts/:id` returns the full
  `image1..3` gallery. Signing is parallelised and cached.

Category matching is case-insensitive (`kerala` works the same as `Kerala`).

All responses are gzip-compressed, and the seed DDL creates
`(created_at DESC, id DESC)` indexes to back the listing sort.

## Setup

```bash
cd nestbackend
npm install
npm run build
npm run seed    # inserts mock resorts + packages (idempotent, upserts by location)
npm run start:dev
```

## Environment

`nestbackend/.env` (gitignored) holds `DATABASE_URL` (Neon pooled connection)
and `PORT`. Connection pooling is handled by Drizzle's `pg` Pool with a bounded
size plus keepalive; tune with `DB_POOL_MAX` / `DB_POOL_IDLE_TIMEOUT_MS` if needed.

## Seeding

`npm run seed` runs idempotent `CREATE TABLE IF NOT EXISTS` DDL (replacing the
old TypeORM `synchronize`), then upserts 6 resorts and 8 packages across the
three categories (Kerala, International, NorthEast). Rows are matched on
`location`, so re-running updates prices/images instead of duplicating.

## Data layer

- **Drizzle ORM** (`drizzle-orm`, node-postgres driver) owns the schema
  (`src/schema/`) and all queries (`src/resorts`, `src/packages`).
- A global `DatabaseModule` provides the `pg` `Pool` and a Drizzle instance
  (token `DRIZZLE`) built from `DATABASE_URL`.
- Entities/`@nestjs/typeorm` are no longer used.
