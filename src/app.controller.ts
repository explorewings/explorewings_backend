import { Controller, Get } from '@nestjs/common';

const BASE = '/rest/v1';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      status: 'ok',
      service: 'explorewings-api',
      version: process.env.npm_package_version ?? '0.0.1',
      base: BASE,
      endpoints: [
        { method: 'GET', path: `${BASE}/health`, description: 'Liveness probe' },
        {
          method: 'GET',
          path: `${BASE}/resorts`,
          description: 'Paginated resorts (page, limit, q)',
        },
        {
          method: 'GET',
          path: `${BASE}/resorts/:id`,
          description: 'Single resort with full gallery',
        },
        {
          method: 'GET',
          path: `${BASE}/tour_packages`,
          description: 'Tour packages (category, case-insensitive)',
        },
        {
          method: 'GET',
          path: `${BASE}/tour_packages/:id`,
          description: 'Single tour package',
        },
      ],
    };
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'explorewings-api',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
