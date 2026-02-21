import { Module } from '@nestjs/common';
import { AnalisysService } from './analisys.service';
import { AnalisysController } from './analisys.controller';

@Module({
  providers: [AnalisysService],
  controllers: [AnalisysController],
  exports: [],
})
export class AnalisysModule {}
