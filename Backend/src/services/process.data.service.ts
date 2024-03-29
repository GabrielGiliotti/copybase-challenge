/* eslint-disable prettier/prettier */
import { FileRepository } from "../repositories/file.repository";
import { ChartModel } from "../models/chart.model";
import { ClientModel } from "../models/client.model";
import { Injectable } from '@nestjs/common';
import { FaturamentoAnual } from "src/models/faturamento.anual.model";
import { ChartedData } from './../models/chart.model';

@Injectable()
export class ProcessDataService {

    private statusCancelado = ['Cancelada', 'Trial cancelado'];
    private statusAtivo = ['Ativa', 'Atrasada', 'Upgrade'];

    constructor(private readonly fileRepository: FileRepository) {}

    async getDefaultPage(): Promise<string> {
        return 'Nest.js API';
    }

    async getFaturamentoAnualAtivo(): Promise<FaturamentoAnual> {
        return this.fileRepository.getFaturamentoAnualAtivo()
    }

    async getFaturamentoAnualCancelado(): Promise<FaturamentoAnual> {
        return this.fileRepository.getFaturamentoAnualCancelado()
    }

    async saveFile(file: any) {
        return this.fileRepository.saveFile(file);
    }

    async buildJson(fileBuffer: Buffer) {
        const csv = fileBuffer.toString();
        const array = csv.toString().split("\r");
        const result = [] as ClientModel[];
        const headers = array[0].split(", ");

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

        const subsequentesAtivos = new FaturamentoAnual();
        const subsequentesCancelados = new FaturamentoAnual();

        result.forEach(async c => {
            c.valor = c.valor.replace(",", ".");

            if(c['cobrada a cada X dias'] === "365") {
                const valorMensal = Number((parseFloat(c.valor) / 12).toFixed(2));

                const date = new Date(c["data início"]);
                const month = date.getMonth();

                const count = 11;
                const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

                if(!this.statusCancelado.includes(c.status)) {
                    for(let i = month; i <= count; i++) {
                        subsequentesAtivos[months[i]] += valorMensal;
                    }
                } else {
                    for(let i = month; i <= count; i++) {
                        subsequentesCancelados[months[i]] += valorMensal;
                    }
                }
                c.valorMensal = null; // Clientes com plano anual tem seu valor mensal nulo
                                      // pois ja estamos contabilizando para todos os meses
                                      // a partir da data de inicio no objeto Faturamento Anual

            } else if (c['cobrada a cada X dias'] === "30") {
                c.valorMensal = Number(parseFloat(c.valor).toFixed(2));
            }
        });

        this.fileRepository.saveFaturamentoAnualAtivo(subsequentesAtivos);
        this.fileRepository.saveFaturamentoAnualCancelado(subsequentesCancelados);
        this.fileRepository.saveJson(result);
        
        return result;
    }

    async preProcessingData() {
        
        const array = await this.fileRepository.getJson();
        const sorted = await this.sortArray(array);
        const arrayMonth = await this.formatDataByMonth(sorted);

        return arrayMonth;
    }

    async sortArray(array: ClientModel[]) {
        if(array.length > 0) {
            array.sort(function(a,b){
                const d1 = new Date(a["data início"]);
                const d2 = new Date(b["data início"]);
    
                if(d1 > d2) return 1;
                else if(d1 < d2) return -1;
                else return 0;
            });
            return array;
        }
    }

    async filterByMonth(arrayMonth: ChartModel[], months: number, metric: string) {

        const chartedData = new ChartedData();
        chartedData.data = [] as number[];
        chartedData.labels = [] as string[];

        arrayMonth.forEach(m => {
            chartedData.labels.push(m.month);
            if(metric === 'mrr') 
                chartedData.data.push(m.mrr);
            else if(metric === 'customer-churn') 
                chartedData.data.push(m.customerChurnRate);
            else if(metric === 'revenue-churn') 
                chartedData.data.push(m.revenueChurnRate);
        });

        if(months <= 3) {
            chartedData.data.splice(3, chartedData.data.length-1);
            chartedData.labels.splice(3, chartedData.labels.length-1);
        } else if (months >= 4 && months <= 6) {
            chartedData.data.splice(6, chartedData.data.length-1);
            chartedData.labels.splice(6, chartedData.labels.length-1);
        } else if (months >= 7 && months <= 9) {
            chartedData.data.splice(9, chartedData.data.length-1);
            chartedData.labels.splice(9, chartedData.labels.length-1);
        }

        return chartedData;
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
            arrayMonth.push(month);
            i++;
        }
                
        array.forEach(e => {

            const date = new Date(e['data início']);

            const month = date.getMonth();
            const year = date.getFullYear();

            if (this.statusAtivo.includes(e.status) && year === 2022) {
                arrayMonth[month].clients.ativos.ano2022.push(e);
            } else if (this.statusAtivo.includes(e.status) && year === 2023) {
                arrayMonth[month].clients.ativos.ano2023.push(e);
            } else if (this.statusCancelado.includes(e.status) && year === 2022) {
                arrayMonth[month].clients.cancelados.ano2022.push(e);
            } else if (this.statusCancelado.includes(e.status) && year === 2023) {
                arrayMonth[month].clients.cancelados.ano2023.push(e);
            }
        });

        return arrayMonth;
    }
}