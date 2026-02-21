import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenIaService {
    public async fetchanalysis(): Promise<any> {
        // Implement your logic to fetch analysis from OpenIA API
        return { message: 'Analysis data from OpenIA API' };
    }
}
