/* eslint-disable prettier/prettier */
import { AtivosCancelados, ChartModel, Clients } from './chart.model';
import { ClientModel } from './client.model';

export class FileRepository {
    private file: any
    private formattedJson: ClientModel[]

    async saveFile(file: any) {
        this.file = file;
    }

    async getFile() {
        return this.file;
    }

    async getJson() {
        return this.formattedJson;
    }

    // Funções AUXILIARES 
    // Poderiam ser colocadas em um Servico ou Arquivo Utils

    async buildJson(fileBuffer: Buffer) {
        const csv = fileBuffer.toString();
        const array = csv.toString().split("\r");
        const result = [] as ClientModel[];
        const headers = array[0].split(", ")
        
        for (let i = 1; i < array.length; i++) {
            const obj = new ClientModel();
        
            const str = array[i]
            let s = ''
            let flag = 0

            for (let ch of str) {
                if (ch === '"' && flag === 0) {
                    flag = 1
                }
                else if (ch === '"' && flag == 1) flag = 0
                if (ch === ', ' && flag === 0) ch = '|'
                if (ch !== '"') s += ch
            }
        
            const properties = s.split("|")
           
            for (const j in headers) {
                const array1 = headers[j].split(",");
                const array2 = properties[j].split(",");

                array2[0] = array2[0].split("\n")[1];
                array2[6] = array2[6] + ',' + array2[7];
                array2.splice(7,1);

                for(let f = 0; f < array1.length; f++) {
                    obj[array1[f]] = array2[f];
                };
            }
        
            result.push(obj)
        }

        result.forEach(c => {
            c.valor = c.valor.replace(",", ".");

            if(c['cobrada a cada X dias'] === "365") {
                c.valorMensal = Number((parseFloat(c.valor) / 12).toFixed(2));
            } else {
                c.valorMensal = Number(parseFloat(c.valor).toFixed(2));
            }
        });

        this.formattedJson = result;
        return result;
    }

    async sortArray(array: ClientModel[]) {
        array.sort(function(a,b){
            const d1 = new Date(a["data início"]);
            const d2 = new Date(b["data início"]);

            if(d1 > d2) return 1;
            else if(d1 < d2) return -1;
            else return 0;
        });
        return array;
    }

    async formatDataByMonth(array: ClientModel[]) {
        
        const arrayMonth = new Array<ChartModel>();
        const monthName = [
            'Janeiro', 
            'Fevereiro', 
            'Março', 
            'Abril', 
            'Maio', 
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro'
        ]

        let i = 0;

        while(i < 12) {
            const month = new ChartModel();
            month.month = monthName[i];
            month.mrr = 0;
            month.churnRate = 0;
            month.clients = new Clients();
            month.clients.ativos = new AtivosCancelados();
            month.clients.ativos.ano2022 = new Array<ClientModel>();
            month.clients.ativos.ano2023 = new Array<ClientModel>();
            month.clients.cancelados = new AtivosCancelados();
            month.clients.cancelados.ano2022 = new Array<ClientModel>();
            month.clients.cancelados.ano2023 = new Array<ClientModel>();
            arrayMonth.push(month);
            i++;
        }
                
        array.forEach(e => {

            const date = new Date(e['data início']);

            const month = date.getMonth();
            const year = date.getFullYear();

            if (e.status === "Ativa" && year === 2022) {
                if(month === 0) arrayMonth[0].clients.ativos.ano2022.push(e);
                if(month === 1) arrayMonth[1].clients.ativos.ano2022.push(e);
                if(month === 2) arrayMonth[2].clients.ativos.ano2022.push(e);
                if(month === 3) arrayMonth[3].clients.ativos.ano2022.push(e);
                if(month === 4) arrayMonth[4].clients.ativos.ano2022.push(e);
                if(month === 5) arrayMonth[5].clients.ativos.ano2022.push(e);
                if(month === 6) arrayMonth[6].clients.ativos.ano2022.push(e);
                if(month === 7) arrayMonth[7].clients.ativos.ano2022.push(e);
                if(month === 8) arrayMonth[8].clients.ativos.ano2022.push(e);
                if(month === 9) arrayMonth[9].clients.ativos.ano2022.push(e);
                if(month === 10) arrayMonth[10].clients.ativos.ano2022.push(e);
                if(month === 11) arrayMonth[11].clients.ativos.ano2022.push(e);
            } else if (e.status === "Ativa" && year === 2023) {
                if(month === 0) arrayMonth[0].clients.ativos.ano2023.push(e);
                if(month === 1) arrayMonth[1].clients.ativos.ano2023.push(e);
                if(month === 2) arrayMonth[2].clients.ativos.ano2023.push(e);
                if(month === 3) arrayMonth[3].clients.ativos.ano2023.push(e);
                if(month === 4) arrayMonth[4].clients.ativos.ano2023.push(e);
                if(month === 5) arrayMonth[5].clients.ativos.ano2023.push(e);
                if(month === 6) arrayMonth[6].clients.ativos.ano2023.push(e);
                if(month === 7) arrayMonth[7].clients.ativos.ano2023.push(e);
                if(month === 8) arrayMonth[8].clients.ativos.ano2023.push(e);
                if(month === 9) arrayMonth[9].clients.ativos.ano2023.push(e);
                if(month === 10) arrayMonth[10].clients.ativos.ano2023.push(e);
                if(month === 11) arrayMonth[11].clients.ativos.ano2023.push(e);
            } else if (e.status === "Cancelada" && year === 2022) {
                if(month === 0) arrayMonth[0].clients.cancelados.ano2022.push(e);
                if(month === 1) arrayMonth[1].clients.cancelados.ano2022.push(e);
                if(month === 2) arrayMonth[2].clients.cancelados.ano2022.push(e);
                if(month === 3) arrayMonth[3].clients.cancelados.ano2022.push(e);
                if(month === 4) arrayMonth[4].clients.cancelados.ano2022.push(e);
                if(month === 5) arrayMonth[5].clients.cancelados.ano2022.push(e);
                if(month === 6) arrayMonth[6].clients.cancelados.ano2022.push(e);
                if(month === 7) arrayMonth[7].clients.cancelados.ano2022.push(e);
                if(month === 8) arrayMonth[8].clients.cancelados.ano2022.push(e);
                if(month === 9) arrayMonth[9].clients.cancelados.ano2022.push(e);
                if(month === 10) arrayMonth[10].clients.cancelados.ano2022.push(e);
                if(month === 11) arrayMonth[11].clients.cancelados.ano2022.push(e);
            } else if (e.status === "Cancelada" && year === 2023) {
                if(month === 0) arrayMonth[0].clients.cancelados.ano2023.push(e);
                if(month === 1) arrayMonth[1].clients.cancelados.ano2023.push(e);
                if(month === 2) arrayMonth[2].clients.cancelados.ano2023.push(e);
                if(month === 3) arrayMonth[3].clients.cancelados.ano2023.push(e);
                if(month === 4) arrayMonth[4].clients.cancelados.ano2023.push(e);
                if(month === 5) arrayMonth[5].clients.cancelados.ano2023.push(e);
                if(month === 6) arrayMonth[6].clients.cancelados.ano2023.push(e);
                if(month === 7) arrayMonth[7].clients.cancelados.ano2023.push(e);
                if(month === 8) arrayMonth[8].clients.cancelados.ano2023.push(e);
                if(month === 9) arrayMonth[9].clients.cancelados.ano2023.push(e);
                if(month === 10) arrayMonth[10].clients.cancelados.ano2023.push(e);
                if(month === 11) arrayMonth[11].clients.cancelados.ano2023.push(e);
            }
        });

        return arrayMonth;
    }
}