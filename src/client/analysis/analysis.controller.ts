import { Controller, Get } from '@nestjs/common';
import { AnalisysService } from './analysis.service';

@Controller('analisys')
export class AnalisysController {

    constructor(private analisysService: AnalisysService) {}

    @Get()
    public async getAnalisys(): Promise<any> {
        const analysisData = await this.analisysService.getAnalisys();
        return { message: analysisData};
    }
}
