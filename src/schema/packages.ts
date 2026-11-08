import { integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { images } from './images';

export const tourPackages = pgTable('tour_packages', {
  id: serial('id').primaryKey(),
  location: text('location').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  total_days: integer('total_days').notNull(),
  price: numeric('price', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  ratings: numeric('ratings', { precision: 3, scale: 1, mode: 'number' })
    .notNull()
    .default(4.4),
  image1Id: integer('image1_id').references(() => images.id),
  image2Id: integer('image2_id').references(() => images.id),
  image3Id: integer('image3_id').references(() => images.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type TourPackageRow = typeof tourPackages.$inferSelect;