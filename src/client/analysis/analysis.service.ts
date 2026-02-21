import { Injectable } from '@nestjs/common';
import { OpenIaService } from 'src/integrations/open-ia/open-ia.service';

@Injectable()
export class AnalisysService {

    constructor( private openIaService: OpenIaService ) {}

    public async getAnalisys(): Promise<any> {
        return await this.openIaService.invoke("Você é um profissional de RH", "Quero ser um Lider Técnico, quais são as habilidades técnicas e comportamentais que preciso desenvolver?");
    }
}
