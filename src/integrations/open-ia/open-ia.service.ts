import { Injectable } from '@nestjs/common';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

@Injectable()
export class OpenIaService {
    private client: BedrockRuntimeClient;

    constructor() {
        this.client = new BedrockRuntimeClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }

    async invoke(systemPrompt: string, userPrompt: string) {
        const body = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 5000,
            temperature: 0.3,
            system: systemPrompt,
            messages: [
                {
                role: "user",
                content: userPrompt,
                },
            ],
        };

        const command = new InvokeModelCommand({
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(body),
        });

        const response = await this.client.send(command);

        const decoded = JSON.parse(
            new TextDecoder().decode(response.body)
        );

        return decoded.content[0].text;
    }

    public async fetchanalysis(): Promise<any> {
        // Implement your logic to fetch analysis from OpenIA API
        return { message: 'Analysis data from OpenIA API' };
    }
}
