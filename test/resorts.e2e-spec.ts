import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ResortsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('rest/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /rest/v1/resorts returns a paginated payload', async () => {
    const res = await request(app.getHttpServer()).get('/rest/v1/resorts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(12);
  });

  it('GET /rest/v1/resorts?page=2&limit=3 respects pagination', async () => {
    const res = await request(app.getHttpServer())
      .get('/rest/v1/resorts?page=2&limit=3')
      .expect(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(3);
    expect(res.body.items.length).toBeLessThanOrEqual(3);
  });

  it('GET /rest/v1/resorts/999999 returns 404', async () => {
    const res = await request(app.getHttpServer()).get('/rest/v1/resorts/999999');
    expect(res.status).toBe(404);
  });

  it('GET /rest/v1/tour_packages?category=Kerala returns array', async () => {
    const res = await request(app.getHttpServer()).get('/rest/v1/tour_packages?category=Kerala');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
