import { Injectable } from '@nestjs/common';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { UserPrompt } from '../../common/interfaces/user-prompt.interface';

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

    async invoke(systemPrompt: string, userPrompt: UserPrompt): Promise<string> {
        const body = {
            anthropic_version: process.env.AI_MODEL_VERSION,
            max_tokens: parseInt(process.env.AI_MAX_TOKENS!, 10),
            temperature: parseFloat(process.env.AI_TEMPERATURE!),
            system: systemPrompt,
            messages: [
                {
                role: "user",
                content: JSON.stringify(userPrompt),
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
