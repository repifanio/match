import { Injectable } from '@nestjs/common';
import { OpenIaService } from 'src/integrations/open-ia/open-ia.service';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

@Injectable()
export class AnalisysService {

    constructor( private openIaService: OpenIaService ) {}

    public async extractPdfText(file: Express.Multer.File): Promise<string> {
        try {
            // Converte o buffer do Multer para um Uint8Array que o PDF.js entende
            const data = new Uint8Array(file.buffer);
            const loadingTask = pdfjs.getDocument({ data });
            const pdf = await loadingTask.promise;
            
            let fullText = '';

            // Percorre todas as páginas para extrair o texto
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n';
            }

            return this.cleanResumeText(fullText);
        } catch (error) {
            console.error('Erro ao processar PDF com PDF.js:', error);
            throw new Error('Falha técnica na extração de dados do currículo.');
        }
    }

    private cleanResumeText(text: string): string {
        if (!text) return '';
        return text
            .replace(/Page \d+ of \d+/g, '')
            .replace(/https?:\/\/\S+/g, '')
            .replace(/\n{2,}/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
    }
}
