import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AnalisysService } from './analysis.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserPrompt } from 'src/common/interfaces/user-prompt.interface';

@Controller('analysis')
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

    @Post('/generate')
    async generateAnalysis(@Body() payload) {
        const { profileText, oportunityDescription } = payload;

        if (!profileText || !oportunityDescription) {
            throw new Error('Dados insuficientes para análise');
        }

        const analysisResult = await this.analisysService.generateAnalysis(profileText, oportunityDescription);

        return {
            analysis: analysisResult,
        };
    }
}
