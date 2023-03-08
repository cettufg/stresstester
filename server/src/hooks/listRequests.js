import fs from 'fs';
import path from "path"

export async function listarArquivosPorDataDeCriacao(nomeArquivo = false) {
  try {
    if (!nomeArquivo) {
      let caminhoDaPasta = "./src/storage/"
      // Lê o diretório assincronamente
      const arquivos = await fs.promises.readdir(caminhoDaPasta);
      // Mapeia os arquivos para um array de objetos com seus nomes e datas de criação
      const arquivosComDatas = await Promise.all(arquivos.map(async arquivo => {
        const caminhoCompleto = path.join(caminhoDaPasta, arquivo);
        const estatisticas = await fs.promises.stat(caminhoCompleto);
        const conteudo = JSON.parse(await fs.promises.readFile(caminhoCompleto, 'utf-8'));
        return { nome: arquivo, dataDeCriacao: estatisticas.birthtimeMs, conteudo };
      }));

      // Ordena o array de objetos por data de criação em ordem decrescente
      arquivosComDatas.sort((a, b) => b.dataDeCriacao - a.dataDeCriacao);
      // Retorna somente os nomes dos arquivos ordenados por data de criação
      return arquivosComDatas;
    } else {
      let caminhoDaPasta = "./src/storage/"
      // Lê o diretório assincronamente
      const arquivos = await fs.promises.readdir(caminhoDaPasta);
      // Mapeia os arquivos para um array de objetos com seus nomes e datas de criação
      const arquivosComDatas = await Promise.all(arquivos.map(async arquivo => {
        if (arquivo == nomeArquivo) {
          const caminhoCompleto = path.join(caminhoDaPasta, arquivo);
          const estatisticas = await fs.promises.stat(caminhoCompleto);
          const conteudo = JSON.parse(await fs.promises.readFile(caminhoCompleto, 'utf-8'));
          return { nome: arquivo, dataDeCriacao: estatisticas.birthtimeMs, conteudo };
        }
      }));
      // Ordena o array de objetos por data de criação em ordem decrescente
      arquivosComDatas.sort((a, b) => b.dataDeCriacao - a.dataDeCriacao);
      // Retorna somente os nomes dos arquivos ordenados por data de criação
      return arquivosComDatas;
    }
  } catch (erro) {
    console.error('Erro ao listar arquivos:', erro);
  }
}
