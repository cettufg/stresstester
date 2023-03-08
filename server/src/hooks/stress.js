import axios from 'axios';
import process from 'process';
import fs from "fs";
import path from "path"
import { info } from "../config/infoDates.js";

export async function stressTester(requests, urls) {
  const results = []; // array para armazenar os resultados das requisições

  console.log(`Iniciando teste de estresse em ${urls.length} URLs.`);

  // Loop sobre as URLs e faz a requisição HTTP requests vezes para cada uma
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const promises = [];

    // Cria uma Promise para cada requisição HTTP e armazena no array promises
    for (let j = 0; j < requests; j++) {
      const start = Date.now();
      const cpuStart = process.cpuUsage();
      const memStart = process.memoryUsage();
      promises.push(axios.get(url).then((response) => {
        const end = Date.now();
        const cpuEnd = process.cpuUsage(cpuStart);
        const memEnd = process.memoryUsage();
        const duration = (end - start) / 1000;
        return {
          url: url,
          duration: duration,
          cpuUsage: cpuEnd,
          memUsage: memEnd,
          success: true
        };
      }).catch((error) => {
        const end = Date.now();
        const cpuEnd = process.cpuUsage(cpuStart);
        const memEnd = process.memoryUsage();
        const duration = end - start;
        return {
          url: url,
          duration: duration,
          cpuUsage: cpuEnd,
          memUsage: memEnd,
          success: false
        };
      }));
    }

    // Executa as requisições HTTP em paralelo e armazena os resultados no array results
    await Promise.all(promises)
      .then((responses) => {
        results.push({
          url: url,
          requests: responses.length,
          successCount: responses.filter((r) => r.success).length,
          errorCount: responses.filter((r) => !r.success).length,
          //totalDuration: responses.reduce((sum, r) => sum + r.duration, 0),
          avgDuration: responses.reduce((sum, r) => sum + r.duration, 0) / responses.length,
          avgCPUUsage: responses.reduce((sum, r) => sum + r.cpuUsage.user / 1000, 0) / responses.length,
          avgMemUsage: responses.reduce((sum, r) => sum + r.memUsage.rss / 1024 / 1024, 0) / responses.length
        });
      });
  }

  console.log(`Teste de estresse finalizado.`);

  saveData(results)
  // Imprime os resultados no console
  return results

}

async function saveData(data) {
  let directory = "./src/storage/"
  let filename = `${info.dia}-${info.mes}-${info.ano}-${info.hora}h-${info.minutos}m.json`;
  const filepath = path.join(directory, filename);
  fs.writeFileSync(filepath, JSON.stringify(data));
}