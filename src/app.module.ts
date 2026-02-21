import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from './infra/http/http.module';
import { OpenIaModule } from './integrations/open-ia/open-ia.module';
import { AnalisysModule } from './client/analisys/analisys.module';
@Module({
  imports: [HttpModule, OpenIaModule, AnalisysModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
