import {
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ResortsService } from './resorts.service';

@Controller('resorts')
export class ResortsController {
  constructor(private readonly resortsService: ResortsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('q') q?: string,
  ) {
    return this.resortsService.findAll({ page, limit, q });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const resort = await this.resortsService.findOne(id);
    if (!resort) {
      throw new NotFoundException(`Resort ${id} not found`);
    }
    return resort;
  }
}
