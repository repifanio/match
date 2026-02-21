import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AnalisysService } from './analysis.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('analisys')
export class AnalisysController {

    constructor(private analisysService: AnalisysService) {}

    @Post('/profile')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('Arquivo não enviado');
        }

        const extractedText = await this.analisysService.extractPdfText(file);

        return {
            extractedText,
        };
    }
}
