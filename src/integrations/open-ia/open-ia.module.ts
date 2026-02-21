import { Module } from '@nestjs/common';
import { OpenIaService } from './open-ia.service';

@Module({
  providers: [OpenIaService],
  exports: [OpenIaService],
})
export class OpenIaModule {}
