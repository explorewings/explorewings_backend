import { integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Central image registry: one row per object stored in the S3-compatible
 * bucket (Neon Object Storage). `resorts` and `tour_packages` reference these
 * rows by id instead of storing raw URL text.
 */
export const images = pgTable(
  'images',
  {
    id: serial('id').primaryKey(),
    bucket: text('bucket').notNull().default('assets'),
    key: text('key').notNull(),
    mime: text('mime'),
    size: integer('size'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('images_bucket_key_uq').on(t.bucket, t.key)],
);

export type ImageRow = typeof images.$inferSelect;