import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { DRIZZLE, DrizzleDb } from '../database.module';
import { images, resorts } from '../schema';
import { StorageService } from '../storage/storage.service';

export type Resort = {
  id: number | string;
  location: string;
  description: string | null;
  price: number;
  ratings: number;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  created_at: Date | string;
};

export type ResortQuery = {
  page?: number;
  limit?: number;
  q?: string;
};

export type PaginatedResorts = {
  items: Resort[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type ResortRow = typeof resorts.$inferSelect;

type ResortWithImageKeys = ResortRow & {
  image1Key: string | null;
  image2Key: string | null;
  image3Key: string | null;
};

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 60;

const img1 = alias(images, 'img1');
const img2 = alias(images, 'img2');
const img3 = alias(images, 'img3');

@Injectable()
export class ResortsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly storage: StorageService,
  ) {}

  async findAll(query: ResortQuery = {}): Promise<PaginatedResorts> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(Math.max(1, query.limit ?? DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;
    const q = query.q?.trim();
    const where = q
      ? or(
          ilike(resorts.location, `%${q}%`),
          ilike(resorts.description, `%${q}%`),
        )
      : undefined;

    const [rows, countRows] = await Promise.all([
      this.db
        .select({
          ...getTableColumns(resorts),
          image1Key: img1.key,
          image2Key: img2.key,
          image3Key: img3.key,
        })
        .from(resorts)
        .leftJoin(img1, eq(img1.id, resorts.image1Id))
        .leftJoin(img2, eq(img2.id, resorts.image2Id))
        .leftJoin(img3, eq(img3.id, resorts.image3Id))
        .where(where)
        .orderBy(desc(resorts.created_at), desc(resorts.id))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(resorts)
        .where(where),
    ]);

    const total = countRows[0]?.count ?? 0;
    return {
      items: await this.mapToResort(rows, false),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Resort | null> {
    const rows = await this.db
      .select({
        ...getTableColumns(resorts),
        image1Key: img1.key,
        image2Key: img2.key,
        image3Key: img3.key,
      })
      .from(resorts)
      .leftJoin(img1, eq(img1.id, resorts.image1Id))
      .leftJoin(img2, eq(img2.id, resorts.image2Id))
      .leftJoin(img3, eq(img3.id, resorts.image3Id))
      .where(eq(resorts.id, id))
      .limit(1);
    return rows[0] ? (await this.mapToResort(rows))[0] : null;
  }

  private async mapToResort(
    rows: ResortWithImageKeys[],
    includeGallery = true,
  ): Promise<Resort[]> {
    if (rows.length === 0) return [];

    if (!includeGallery) {
      const image1 = await this.storage.signMany(rows.map((row) => row.image1Key));
      return rows.map((row, index) => ({
        id: row.id,
        location: row.location,
        description: row.description,
        price: Number(row.price),
        ratings: row.ratings === null ? 4.5 : Number(row.ratings),
        image1: image1[index],
        image2: null,
        image3: null,
        created_at: row.created_at,
      }));
    }

    const signed = await this.storage.signMany(
      rows.flatMap((row) => [row.image1Key, row.image2Key, row.image3Key]),
    );
    let cursor = 0;
    return rows.map((row) => {
      const i1 = signed[cursor++];
      const i2 = signed[cursor++];
      const i3 = signed[cursor++];
      return this.toResort(row, i1, i2, i3);
    });
  }

  private toResort(
    row: ResortWithImageKeys,
    image1: string | null,
    image2: string | null,
    image3: string | null,
  ): Resort {
    return {
      id: row.id,
      location: row.location,
      description: row.description,
      price: Number(row.price),
      ratings: row.ratings === null ? 4.5 : Number(row.ratings),
      image1,
      image2: image2 ?? image1,
      image3: image3 ?? image1,
      created_at: row.created_at,
    };
  }
}
