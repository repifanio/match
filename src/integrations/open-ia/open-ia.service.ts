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
            anthropic_version: process.env.AI_MODEL_VERSION,
            max_tokens: process.env.AI_MAX_TOKENS,
            temperature: process.env.AI_TEMPERATURE,
            system: systemPrompt,
            messages: [
                {
                role: "user",
                content: userPrompt,
                },
            ],
        };

        const command = new InvokeModelCommand({
            modelId: process.env.AI_MODEL_ID,
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
}
