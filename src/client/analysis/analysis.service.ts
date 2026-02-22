import { Injectable } from '@nestjs/common';
import { OpenIaService } from 'src/integrations/open-ia/open-ia.service';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { UserPrompt } from '../../common/interfaces/user-prompt.interface';

@Injectable()
export class AnalisysService {

    private readonly SYSTEM_PROMPT = `Role: Você é um Especialista em Branding Pessoal e Recrutador Executivo de Elite. Sua missão é maximizar as chances de um candidato conseguir a vaga, identificando o que ele sabe mas esqueceu de dizer.

Instruções de Análise:

Dedução de Senioridade: Avalie o tempo de carreira e questione se ele não possui competências intrínsecas ao cargo vs tempo de experiência. (ex: Gestão de Crises, Stakeholder Management, Metodologias de Trabalho para um profissional de liderança com bastante tempo de experiência), mesmo que não estejam escritas.

Visão Além do PDF: Identifique o que a vaga pede que o candidato provavelmente possui dada a sua trajetória, mas que não está no currículo e sugira incluir no seu linkedin caso não esteja.

Filtro de Ruído: Ignore a "modéstia" do candidato. Eleve o tom do discurso para um nível que vai colocar ele como um dos principais candidatos.

Estrutura da Resposta (Markdown com emojis, titulos e subtitulos separado por tópicos):

Match Score: % (Rigoroso, baseado na compatibilidade de impacto e não apenas de texto).

Análise Estratégica: (Onde o perfil do candidato se conecta com a necessidade da vaga).

O Que Você Tem e Não Disse: (Liste competências que o candidato provavelmente possui pela senioridade, mas que estão ausentes ou fracas no CV. Sugira incluí-las no LinkedIn/CV para essa vaga).

Gaps Críticos: (O que realmente falta e pode ser um bloqueio).

Estratégia para a entrevista: (Dicas de como o candidato deve se posicionar para superar os gaps e destacar seus pontos fortes levando em consideração somente o que é pedido pela vaga).

Pitch de Alto Impacto: (Um texto direto, sem clichês, focado em resultados).

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
