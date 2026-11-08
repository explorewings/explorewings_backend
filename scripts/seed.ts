import 'dotenv/config';
import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  resortImages,
  resorts as resortsTable,
  tourPackages,
} from '../src/schema';

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const gallery = (a: string, b: string, c: string) => [U(a), U(b), U(c)];

type ResortSeed = {
  location: string;
  description: string;
  price: number;
  ratings: number;
  images: string[];
};

const resorts: ResortSeed[] = [
  {
    location: 'Munnar, Kerala',
    description:
      'Cliffside tea-garden retreat above the clouds — misty mornings, spice gardens and an infinity pool facing the Western Ghats.',
    price: 8500,
    ratings: 4.8,
    images: gallery('1602216056096-3b40cc0c9944', '1593693411515-c20261bcad6e', '1506929562872-bb421503ef21'),
  },
  {
    location: 'Alleppey, Kerala',
    description:
      'Private houseboat marina on Vembanad Lake with gourmet Kerala cuisine, sunset cruises and canoe villages.',
    price: 12500,
    ratings: 4.7,
    images: gallery('1519671482749-fd09be7ccebf', '1566073771259-6a8506099945', '1506929562872-bb421503ef21'),
  },
  {
    location: 'Varkala, Kerala',
    description:
      'Red-cliff beach resort steps from Papanasam Beach — Ayurveda spa, cliff-top infinity pool and seafood grills at dusk.',
    price: 7200,
    ratings: 4.6,
    images: gallery('1477587458883-47145ed94245', '1507525428034-b723cf961d3e', '1580977276076-ae4b8c219b8e'),
  },
  {
    location: 'Wayanad, Kerala',
    description:
      'Rainforest treehouse estate with waterfall treks, bamboo rafting and campfire dinners under the stars.',
    price: 9500,
    ratings: 4.9,
    images: gallery('1512343879784-a960bf40e7f2', '1470071459604-3b5ec3a7fe05', '1506744038136-46273834b3fb'),
  },
  {
    location: 'Bali, Indonesia',
    description:
      'Jungle villa with private pool in Ubud — rice-terrace views, Balinese spa rituals and sunrise volcano breakfasts.',
    price: 18900,
    ratings: 4.9,
    images: gallery('1585016495481-91613a3ab1bc', '1518548419970-58e3b4079ab2', '1544735716-392fe2489ffa'),
  },
  {
    location: 'Maldives',
    description:
      'Overwater villa with glass floors and a private deck ladder into the lagoon — house reef snorkeling at sunrise.',
    price: 32000,
    ratings: 5.0,
    images: gallery('1571536802807-30451e3955d8', '1573843981267-be1999ff37cd', '1564760055775-d63b17a55c44'),
  },
];

type PackageSeed = {
  location: string;
  description: string;
  category: 'Kerala' | 'International' | 'NorthEast';
  total_days: number;
  price: number;
  ratings: number;
  image1: string;
  image2: string;
  image3: string;
};

const packages: PackageSeed[] = [
  {
    location: 'Munnar & Alleppey Romantic Escape',
    description:
      'Tea-estate stay in Munnar, houseboat night on Vembanad Lake, Kathakali evening and Ayurvedic couple spa.',
    category: 'Kerala',
    total_days: 5,
    price: 24500,
    ratings: 4.8,
    image1: U('1605649487212-47bdab064df7'),
    image2: U('1519671482749-fd09be7ccebf'),
    image3: U('1476231682828-37e571bc172f'),
  },
  {
    location: 'Kochi Heritage & Beach Hopper',
    description:
      'Fort Kochi walks, Chinese fishing nets, Mattancherry cafés, then Varkala cliffs and Kovalam sands.',
    category: 'Kerala',
    total_days: 4,
    price: 18900,
    ratings: 4.6,
    image1: U('1590050752117-238cb0fb12b1'),
    image2: U('1441974231531-c6227db76b6e'),
    image3: U('1506929562872-bb421503ef21'),
  },
  {
    location: 'Wayanad Wildlife & Waterfalls',
    description:
      'Treehouse stay, Edakkal caves, Banasura dam and a bamboo-raft safari in the Wayanad rainforest belt.',
    category: 'Kerala',
    total_days: 3,
    price: 14200,
    ratings: 4.7,
    image1: U('1626621341517-bbf3d9990a23'),
    image2: U('1470071459604-3b5ec3a7fe05'),
    image3: U('1506744038136-46273834b3fb'),
  },
  {
    location: 'Bali Honeymoon Duo',
    description:
      'Ubud jungle villa plus Seminyak beach club — private pool, Balinese spa, Nusa Penida day cruise.',
    category: 'International',
    total_days: 7,
    price: 89500,
    ratings: 4.9,
    image1: U('1516483638261-f4dbaf036963'),
    image2: U('1518548419970-58e3b4079ab2'),
    image3: U('1512453979798-5ea266f8880c'),
  },
  {
    location: 'Dubai City & Desert Luxe',
    description:
      'Burj Khalifa sky deck, dhow dinner cruise, dune bashing with BBQ, Atlantis waterpark day.',
    category: 'International',
    total_days: 6,
    price: 74800,
    ratings: 4.7,
    image1: U('1512453979798-5ea266f8880c'),
    image2: U('1518684079-3c830dcef090'),
    image3: U('1546412414-e1885259563a'),
  },
  {
    location: 'Maldives Overwater Escape',
    description:
      'Seaplane transfer to a private island, overwater villa, sunset dolphin cruise and house-reef diving.',
    category: 'International',
    total_days: 5,
    price: 118000,
    ratings: 5.0,
    image1: U('1533105079780-92b9be482077'),
    image2: U('1573843981267-be1999ff37cd'),
    image3: U('1507525428034-b723cf961d3e'),
  },
  {
    location: 'Shillong & Cherrapunji Cloud Circuit',
    description:
      'Living root bridges, Nohkalikai falls, Dawki river boating and Shillong café nights.',
    category: 'NorthEast',
    total_days: 5,
    price: 27500,
    ratings: 4.8,
    image1: U('1528181304800-259b08848526'),
    image2: U('1472214103451-9374bd1c798e'),
    image3: U('1470071459604-3b5ec3a7fe05'),
  },
  {
    location: 'Kaziranga & Majuli River Island',
    description:
      'Rhino safaris in Kaziranga, Majuli monastery villages, Brahmaputra ferry and Mishing tribal lunch.',
    category: 'NorthEast',
    total_days: 6,
    price: 33900,
    ratings: 4.9,
    image1: U('1470071459604-3b5ec3a7fe05'),
    image2: U('1506744038136-46273834b3fb'),
    image3: U('1476231682828-37e571bc172f'),
  },
];

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set — check nestbackend/.env');
  }

  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  // --- DDL (idempotent; replaces TypeORM synchronize) ---
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS images (
      id serial PRIMARY KEY,
      bucket text NOT NULL DEFAULT 'assets',
      key text NOT NULL,
      mime text,
      size integer,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT images_bucket_key_uq UNIQUE (bucket, key)
    );
    CREATE TABLE IF NOT EXISTS resorts (
      id serial PRIMARY KEY,
      location text NOT NULL UNIQUE,
      description text,
      price numeric(10,2) NOT NULL,
      ratings numeric(3,1) NOT NULL DEFAULT 4.5,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS resort_images (
      id serial PRIMARY KEY,
      "resortId" integer NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
      url text NOT NULL,
      position smallint NOT NULL DEFAULT 1,
      UNIQUE ("resortId", position)
    );
    CREATE TABLE IF NOT EXISTS tour_packages (
      id serial PRIMARY KEY,
      location text NOT NULL,
      description text,
      category text NOT NULL,
      total_days integer NOT NULL,
      price numeric(10,2) NOT NULL,
      ratings numeric(3,1) NOT NULL DEFAULT 4.4,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE resorts ADD COLUMN IF NOT EXISTS image1_id integer REFERENCES images(id);
    ALTER TABLE resorts ADD COLUMN IF NOT EXISTS image2_id integer REFERENCES images(id);
    ALTER TABLE resorts ADD COLUMN IF NOT EXISTS image3_id integer REFERENCES images(id);
    ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS image1_id integer REFERENCES images(id);
    ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS image2_id integer REFERENCES images(id);
    ALTER TABLE tour_packages ADD COLUMN IF NOT EXISTS image3_id integer REFERENCES images(id);
    CREATE INDEX IF NOT EXISTS tour_packages_category_idx ON tour_packages (category);
    CREATE INDEX IF NOT EXISTS resorts_created_at_id_idx ON resorts (created_at DESC, id DESC);
    CREATE INDEX IF NOT EXISTS tour_packages_created_at_id_idx ON tour_packages (created_at DESC, id DESC);
  `));

  // --- Resorts (upsert by location; rebuild image rows each run) ---
  for (const seed of resorts) {
    const [resort] = await db
      .insert(resortsTable)
      .values({
        location: seed.location,
        description: seed.description,
        price: seed.price,
        ratings: seed.ratings,
      })
      .onConflictDoUpdate({
        target: resortsTable.location,
        set: {
          description: seed.description,
          price: seed.price,
          ratings: seed.ratings,
        },
      })
      .returning({ id: resortsTable.id });

    await db.delete(resortImages).where(eq(resortImages.resortId, resort.id));
    if (seed.images.length > 0) {
      await db.insert(resortImages).values(
        seed.images.map((imageUrl, index) => ({
          resortId: resort.id,
          url: imageUrl,
          position: index + 1,
        })),
      );
    }
  }

  // --- Packages (upsert by location within each category; no unique index on
  // (location, category), so update first and insert only when nothing matched) ---
  for (const seed of packages) {
    const fields = {
      description: seed.description,
      total_days: seed.total_days,
      price: seed.price,
      ratings: seed.ratings,
    };
    const updated = await db
      .update(tourPackages)
      .set(fields)
      .where(
        and(
          eq(tourPackages.location, seed.location),
          eq(tourPackages.category, seed.category),
        ),
      )
      .returning({ id: tourPackages.id });

    if (updated.length === 0) {
      await db.insert(tourPackages).values({
        location: seed.location,
        category: seed.category,
        ...fields,
      });
    }
  }

  const [resortCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(resortsTable);
  const [packageCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tourPackages);
  console.log(
    `Seed complete: ${resortCount.count} resorts, ${packageCount.count} packages.`,
  );

  await pool.end();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
