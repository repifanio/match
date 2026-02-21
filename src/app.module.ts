import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenIaModule } from './integrations/open-ia/open-ia.module';
import { AnalisysModule } from './client/analysis/analysis.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OpenIaModule, 
    AnalisysModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
