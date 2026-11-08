import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../database.module';
import { images, tourPackages } from '../schema';
import { StorageService } from '../storage/storage.service';

export type Package = {
  id: number | string;
  location: string;
  description: string | null;
  category: string;
  total_days: number;
  price: number;
  ratings: number;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  created_at: Date | string;
};

type PackageRow = typeof tourPackages.$inferSelect;

const categoryMatch = (category: string) =>
  eq(tourPackages.category, category);

@Injectable()
export class PackagesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly storage: StorageService,
  ) {}

  async findAll(category?: string): Promise<Package[]> {
    const rows = await this.db
      .select()
      .from(tourPackages)
      .where(category ? categoryMatch(category) : undefined)
      .orderBy(desc(tourPackages.created_at), desc(tourPackages.id));
    return this.mapToPackage(rows);
  }

  async findOne(id: number, category?: string): Promise<Package | null> {
    const rows = await this.db
      .select()
      .from(tourPackages)
      .where(
        category
          ? and(eq(tourPackages.id, id), categoryMatch(category))
          : eq(tourPackages.id, id),
      )
      .limit(1);
    return rows[0] ? this.mapToPackage([rows[0]])[0] : null;
  }

  private async mapToPackage(rows: PackageRow[]): Promise<Package[]> {
    if (rows.length === 0) return [];
    const allImageIds = new Set<number>();
    for (const row of rows) {
      if (row.image1Id) allImageIds.add(row.image1Id);
      if (row.image2Id) allImageIds.add(row.image2Id);
      if (row.image3Id) allImageIds.add(row.image3Id);
    }
    const ids = Array.from(allImageIds);
    if (ids.length === 0) return rows.map((row) => ({
      id: row.id,
      location: row.location,
      description: row.description,
      category: row.category,
      total_days: Number(row.total_days),
      price: Number(row.price),
      ratings: row.ratings === null ? 4.4 : Number(row.ratings),
      image1: null,
      image2: null,
      image3: null,
      created_at: row.created_at,
    }));
    const imageRows = await this.db
      .select({ id: images.id, key: images.key })
      .from(images)
      .where(inArray(images.id, ids));
    const keyById = new Map<number, string>();
    for (const img of imageRows) keyById.set(img.id, img.key);
    const signedUrls = await this.storage.signMany(
      Array.from(keyById.values()),
    );
    const signed = new Map<string, string | null>(
      Array.from(keyById.values()).map((key, index) => [key, signedUrls[index]]),
    );
    return rows.map((row) => {
      const i1 = row.image1Id ? keyById.get(row.image1Id) ?? '' : '';
      const i2 = row.image2Id ? keyById.get(row.image2Id) ?? '' : '';
      const i3 = row.image3Id ? keyById.get(row.image3Id) ?? '' : '';
      return {
        id: row.id,
        location: row.location,
        description: row.description,
        category: row.category,
        total_days: Number(row.total_days),
        price: Number(row.price),
        ratings: row.ratings === null ? 4.4 : Number(row.ratings),
        image1: signed.get(i1) ?? null,
        image2: signed.get(i2) ?? signed.get(i1) ?? null,
        image3: signed.get(i3) ?? signed.get(i1) ?? null,
        created_at: row.created_at,
      };
    });
  }
}