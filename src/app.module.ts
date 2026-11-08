import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database.module';
import { StorageModule } from './storage/storage.module';
import { AppController } from './app.controller';
import { ResortsModule } from './resorts/resorts.module';
import { PackagesModule } from './packages/packages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    DatabaseModule,
    StorageModule,
    ResortsModule,
    PackagesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}