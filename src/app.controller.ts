import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return { status: 'ok', service: 'explorewings-api', base: '/rest/v1' };
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'explorewings-api' };
  }
}
