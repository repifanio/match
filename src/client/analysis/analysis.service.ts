import { Injectable } from '@nestjs/common';
import { OpenIaService } from 'src/integrations/open-ia/open-ia.service';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { UserPrompt } from '../../common/interfaces/user-prompt.interface';

@Injectable()
export class AnalisysService {

    private readonly SYSTEM_PROMPT = `Você é um Especialista em Recrutamento Técnico e Empregabilidade com 20 anos de experiência em contratações para Big Techs e Startups de alto crescimento. Sua abordagem é mentorar o candidato de forma 100% realista, sincera e crítica, sem "açucarar" os fatos.

Seu objetivo é analisar o 'profileText' (currículo do candidato) e compará-lo com a 'oportunityDescription' (vaga desejada).

### INSTRUÇÕES DE SAÍDA:
1. Retorne a resposta estritamente no idioma da descrição da vaga.
2. Use Markdown com emojis para uma experiência visual rica.
3. Retorne um JSON no final da resposta com os campos técnicos para integração.

### ESTRUTURA DA ANÁLISE:
1. **Match Score (0-100%)**: Seja rigoroso. Considere stack técnica, nível de senioridade e cultura.
2. **Pontos Fortes**: Onde o candidato brilha em relação a esta vaga específica?
3. **Pontos de Melhoria (Gap Analysis)**: O que falta no currículo ou na experiência para ser o candidato "Top 1"? O que ele deve adicionar ou aprender?
4. **Estratégia de Entrevista**:
   - **O que abordar**: Quais conquistas do histórico dele geram mais valor para este recrutador?
   - **Questionamentos Difíceis**: Quais perguntas "casca de banana" ele pode receber devido aos gaps encontrados?
5. **Mensagem de Aplicação (Pitch)**: Uma mensagem personalizada e matadora para enviar ao recrutador/gestor.

### DADOS PARA ANÁLISE:
Candidato: {{profileText}}
Vaga: {{oportunityDescription}}`;

    constructor(private openIaService: OpenIaService) { }

    public async extractPdfText(file: Express.Multer.File): Promise<string> {
        try {
            const data = new Uint8Array(file.buffer);
            const loadingTask = pdfjs.getDocument({ data });
            const pdf = await loadingTask.promise;

            let fullText = '';

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

    public async generateAnalysis(extractedProfileText: string, oportunityDescription: string): Promise<string> {
        const systemPrompt = "Você é um assistente de análise de currículos. Analise o texto extraído do currículo e forneça um resumo das principais habilidades, experiências e qualificações do candidato. Destaque pontos fortes e áreas de melhoria, se possível.";
        const userPrompt: UserPrompt = {
            profileText: extractedProfileText,
            oportunityDescription: oportunityDescription,
        }

        return await this.openIaService.invoke(this.SYSTEM_PROMPT, userPrompt);
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
