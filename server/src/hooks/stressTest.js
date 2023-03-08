import fs from 'fs';
import { info } from '../config/infoDates.js';
import winston from 'winston';
import axios from 'axios';
import { performance } from 'perf_hooks';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import si from 'systeminformation';
import { URL } from 'url';

const directory = './src/storage';
//const filename = `${info.dia}-${info.mes}-${info.ano}-${info.hora}h-${info.minutos}m-${info.segundos}s.json`;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'stress-tester' },
    transports: [
        new winston.transports.File({ filename: '/src/logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: '/src/logs/combined.log' }),
    ],
});

const durationInSeconds = 10; // duração do teste em segundos
const generatePayload = () => {
    const id = uuidv4(); // gera um ID único para cada solicitação
    return { id };
};

const runTest = async (endpoint, numberOfRequests) => {
    const metrics = []; // array que armazenará as métricas de cada solicitação
    const startTime = performance.now();
    let timeInit = performance.now();
    const endTime = startTime + durationInSeconds * 1000;
    const requests = [];
    let sucessRequests = 0;
    let errorRequests = 0;
    for (let i = 0; i < numberOfRequests; i++) {
        requests.push(sendRequest(i));
    }
    await Promise.all(requests);
    let timeFinish = performance.now();
    const systemInfo = await si.get({
        cpu: 'manufacturer, brand, speed',
        osInfo: 'platform, distro, release',
        mem: 'total',
    }); // coleta informações do sistema para adicionar ao resultado
    const id = generatePayload();

    const result = {
        id: id.id,
        endpoint,
        numberOfRequests,
        durationInSeconds,
        metrics,
        errorRequests,
        sucessRequests,
        responseTime: (timeFinish - timeInit) / 1000,
        systemInfo: {
            cpu: systemInfo.cpu,
            osInfo: systemInfo.osInfo,
            memory: systemInfo.mem,
        },
    };

    const pathname = new URL(endpoint).pathname;
    const filename = `${info.timestamp}-${pathname.replace(/\//g, "-")}-relatorio.json`;

    saveResults(filename, result)

    async function sendRequest(n) {
        let parando = false;
        const requestStartTime = performance.now();
        try {
            const response = await axios.get(endpoint);
            const requestEndTime = performance.now();
            const responseTime = (requestEndTime - requestStartTime) / 1000;
            const load = await si.currentLoad();
            const mem = await si.mem();
            sucessRequests++
            metrics.push({
                indice: n,
                status: response.status,
                responseTime,
                cpuLoad: load.currentload,
                ramUsage: mem.used
            });
        } catch (error) {
            const id = generatePayload();
            const requestEndTime = performance.now();
            const responseTime = (requestEndTime - requestStartTime) / 1000;
            const load = await si.currentLoad();
            const mem = await si.mem();
            errorRequests++
            metrics.push({
                indice: n,
                status: error.response ? error.response.status : 'Error',
                responseTime,
                cpuLoad: load.currentload,
                ramUsage: mem.used
            });
            if (performance.now() < endTime) {
                parando = true
            }
        }
    }
    console.log('Finalizando... ')
    return result
};
const saveResults = (pathArch, results) => {
    fs.writeFile(`${directory}/${pathArch}`, JSON.stringify(results), (err) => {
        if (err) {
            logger.error(`Error saving stress test results: ${err}`);
        } else {
            logger.info('Stress test results saved successfully');
        }
    });
};
function validarUrlAxios(url) {
    try {
        const urlObj = new URL(url);
        if (!urlObj.protocol || !urlObj.hostname) {
            return false;
        }
        return true;
    } catch (err) {
        console.log('URL INVALIDA')
        return false;
    }
}
export async function stressTest(requests, urls) {
    const promises = [];
    urls.forEach(async (i) => {
        if (validarUrlAxios(i)) {
            promises.push(runTest(i, requests));
        } else {

        }
    })
    let dados = await Promise.all(promises);
    return { "code": 200, "message": "Requisições iniciadas", dados }
}


