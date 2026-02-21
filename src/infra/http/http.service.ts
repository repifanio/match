import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpService {
    public async get(url: string): Promise<any> {
        const response = await fetch(url);
        return response.json();
    }

    public async post(url: string, data: any): Promise<any> {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }
}
