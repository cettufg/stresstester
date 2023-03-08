import express from 'express';
import cors from 'cors';
import { getSystemInfo } from './hooks/getinfo.js';
import { stressTester } from './hooks/stress.js';
import { stressTest } from './hooks/stressTest.js';
import { listarArquivosPorDataDeCriacao } from './hooks/listRequests.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const corsOptions = {
    origin: [process.env.FRONTEND_URL]
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.json({ code: 200, message: "Sucesso" });
});
app.get('/getInfos', (req, res) => {
    let data = getSystemInfo();
    res.json({ code: 200, message: "Sucesso", data });
});

app.get('/stress', async (req, res) => {
    let links = req?.query?.links
    let countRequests = req?.query?.countRequests ?? 3
    if (!links) {
        res.json({ code: 404, error: true, message: "Voce Precisa Informar um Link" });
        return
    }
    links = links.split(';')
    try {
        let data = await stressTest(countRequests, links)
        res.json({ code: 200, message: "Sucesso", data });
    } catch (err) {
        res.json({ code: 404, message: "Erro Desconhecido" });
    }
});

app.get('/getRequests', async (req, res) => {
    let nomeArquivo = req?.query?.p
    let data = await listarArquivosPorDataDeCriacao(nomeArquivo)
    res.json({ code: 200, message: "Sucesso", data });
});
app.listen(3000, () => {
    console.log('Server running on port 3000');
});