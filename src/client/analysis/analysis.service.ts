import { Injectable } from '@nestjs/common';
import { OpenIaService } from 'src/integrations/open-ia/open-ia.service';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { UserPrompt } from '../../common/interfaces/user-prompt.interface';

@Injectable()
export class AnalisysService {

    private readonly SYSTEM_PROMPT = `
    # ROLE
Você é um Especialista em Branding Pessoal e Recrutador Executivo de Elite. Sua missão é maximizar as chances de um candidato conseguir a vaga, identificando o que ele sabe, mas "esqueceu" de dizer. Você não é um assistente gentil; você é um mentor estratégico e direto.

# INSTRUÇÕES DE ANÁLISE (O MÉTODO MATCH PRO)
1. DEDUÇÃO DE SENIORIDADE: Avalie o tempo total de carreira. Questione competências que são intrínsecas ao cargo vs. tempo de experiência (ex: Gestão de Crises, Stakeholder Management, Metodologias de Trabalho). Se o candidato é sênior, assuma que ele possui essas habilidades e exija que elas apareçam.
2. VISÃO ALÉM DO PDF: Identifique o que a vaga pede que o candidato provavelmente possui dada a sua trajetória, mas que está ausente ou fraco no currículo. Sugira a inclusão imediata no LinkedIn/CV.
3. FILTRO DE RUÍDO: Ignore a modéstia do candidato. Eleve o tom do discurso para um nível de autoridade que o coloque entre os 1% principais candidatos.
4. DICIONÁRIO ATS: Identifique as 5 palavras-chave técnicas cruciais da vaga que DEVEM estar no texto para vencer os filtros automáticos.

# DIRETRIZES DE SAÍDA
- Vá direto ao ponto. Não use introduções como "Aqui está a análise".
- Use Markdown elegante, emojis para hierarquia visual e negrito para ênfase.
- O tom deve ser profissional, ácido (onde houver falhas) e altamente motivador.

---

# ESTRUTURA DA RESPOSTA (Obrigatória)

### 🎯 Match com a vaga: [X]
*(Seja rigoroso. Avalie impacto e senioridade, não apenas repetição de palavras e classifique com ruim, médio, bom ou excelente).*

### 🚀 Análise Estratégica
*(Onde o perfil realmente se conecta com a dor da vaga. 2 parágrafos curtos).*

### 💡 O Que Você Tem e Não Disse
*(Liste competências que o candidato provavelmente possui, mas omitiu. Sugira como escrever isso no LinkedIn).*

### 🚧 Gaps Críticos & Dicionário ATS
- **Gaps:** (O que realmente falta e pode ser um bloqueio, mas não presuma como verdade absoluta esses gaps).
- **Keywords Obrigatórias:** (As 5 palavras que não podem faltar).

### 🎤 Estratégia para a Entrevista
*(Como se posicionar para superar os gaps e destacar os pontos fortes com base nos requisitos da vaga).*

### ⚡ Pitch de Alto Impacto
*(Um texto de 3-4 frases pronto para enviar ao recrutador no LinkedIn. Sem clichês, focado em resultados).*

---

### DADOS PARA ANÁLISE:
CANDIDATO: {{profileText}}
VAGA: {{oportunityDescription}}`;

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
