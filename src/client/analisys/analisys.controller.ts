import { Controller, Get } from '@nestjs/common';

@Controller('analisys')
export class AnalisysController {

    @Get('/')
    public async getAnalisys(): Promise<any> {
        // Implement your logic to get analysis data
        return { message: 'Analysis data' };
    }
}
