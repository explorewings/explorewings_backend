import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('tour_packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.packagesService.findAll(category);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('category') category?: string,
  ) {
    const pkg = await this.packagesService.findOne(id, category);
    if (!pkg) {
      throw new NotFoundException(`Package ${id} not found`);
    }
    return pkg;
  }
}
