import { Module } from '@nestjs/common';
import { AnalisysService } from './analysis.service';
import { AnalisysController } from './analysis.controller';
import { OpenIaModule } from '../../integrations/open-ia/open-ia.module';

@Module({
  imports: [OpenIaModule],
  providers: [AnalisysService],
  controllers: [AnalisysController],
  exports: [],
})
export class AnalisysModule {}
