import React, { useState, useEffect } from 'react';
import ApexCharts from 'apexcharts';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css'

function Relatorios() {
    const [showSpinner, setShowSpinner] = useState(true);
    const [Relatorio, setRelatorio] = useState([]);
    const [cpuUsage, setCpuUsage] = useState(0);
    const [memoryUsage, setMemoryUsage] = useState(0);
    const [discoUsage, setDiscoUsage] = useState(0);
    const [cpuNucleos, setcpuNucleos] = useState(0);
    const [maxMemoria, setmaxMemoria] = useState(0);
    const [sortedMetrics, setsortedMetrics] = useState([]);
    const [TempoMedioResposta, setTempoMedioResposta] = useState(0);
    const [sucessRequests, setsucessRequests] = useState(0);
    const [errorRequests, seterrorRequests] = useState(0);
    const [maxResponseTime, setmaxResponseTime] = useState(0);
    const [minResponseTime, setminResponseTime] = useState(0);
    const [maxUsoMemoria, setmaxUsoMemoria] = useState(0);
    const [minUsoMemoria, setminUsoMemoria] = useState(0);
    const [percSucess, setpercSucess] = useState(0);
    const navigateTo = useNavigate();
    useEffect(() => {
        atualizaInfos()
        setTimeout(() => {
            setShowSpinner(false);
        }, 1000);
        const searchParams = new URLSearchParams(window.location.search);
        const nomeDoRelatorio = searchParams.get('p');
        if (!nomeDoRelatorio || nomeDoRelatorio == null || nomeDoRelatorio == undefined) {
            navigateTo('/');
            return;
        } else {
            getLastRequests(nomeDoRelatorio)
        }
    }, []);

    const atualizaInfos = async () => {
        axios.get('http://localhost:3000/getInfos')
            .then(response => {
                if (response.data.code == 200) {
                    let data = response.data.data
                    setCpuUsage(((data.cpuUsagePercent)).toFixed(2))
                    setMemoryUsage((data.memoryUsagePercent).toFixed(2))
                    setDiscoUsage((data.usedPercent).toFixed(2))
                    setcpuNucleos((data.cpus))
                    setmaxMemoria(((data.totalMemory) / 1000000000))
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    const populaRelatorio = async (data) => {
        const sortedMetrics = data?.conteudo?.metrics.sort((a, b) => a.indice - b.indice);
        let totalTime = 0;

        for (let i = 0; i < sortedMetrics.length; i++) {
            totalTime += sortedMetrics[i].responseTime;
        }
        const averageTime = totalTime / sortedMetrics.length;
        const maxResponseTime = sortedMetrics.reduce((max, metric) => {
            return metric.responseTime > max ? metric.responseTime : max;
        }, 0);
        const minResponseTime = sortedMetrics.reduce((min, metric) => {
            return metric.responseTime < min ? metric.responseTime : min;
        }, Number.MAX_VALUE);
        const maxUsoMemoria = sortedMetrics.reduce((max, metric) => {
            return metric.ramUsage > max ? metric.ramUsage : max;
        }, 0);
        const minUsoMemoria = sortedMetrics.reduce((min, metric) => {
            return metric.ramUsage < min ? metric.ramUsage : min;
        }, Number.MAX_VALUE);
        setsortedMetrics(sortedMetrics)
        setTempoMedioResposta(averageTime)
        setmaxResponseTime((maxResponseTime))
        setminResponseTime(minResponseTime)
        setmaxUsoMemoria((maxUsoMemoria / 1000000000))
        setminUsoMemoria((minUsoMemoria / 1000000000))
        setsucessRequests(data?.conteudo?.sucessRequests)
        seterrorRequests(data?.conteudo?.errorRequests)
        setpercSucess((data?.conteudo?.sucessRequests / sortedMetrics.length) * 100)

        var options = {
            chart: {
                id: 'grafico-de-linha'
            },
            height: 120,
            markers: {
                size: 2,
            },
            xaxis: {
                categories: sortedMetrics.map(metric => metric.indice)
            },
            series: [
                {
                    name: 'Tempo de resposta',
                    data: sortedMetrics.map(metric => metric.responseTime)
                }
            ]
        };
        //var chart = new ApexCharts(document.querySelector('#chart1'), options)
        //chart.render()
    }

    const getLastRequests = async (nome = "") => {
        axios.get(`http://localhost:3000/getRequests?p=${nome}`)
            .then(response => {
                if (response?.data?.code === 200) {
                    setRelatorio(response.data.data[0])
                    populaRelatorio(response.data.data[0])
                }
                setShowSpinner(false);
            })
            .catch(error => {
                console.log(error);
                setShowSpinner(false);
            });
    }
    return (
        <div className="container-fluid position-relative d-flex p-0">
            {/* <!-- Spinner Start --> */}
            {showSpinner && (
                <div id="spinner" className="show bg-dark position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
                    <div className="spinner-border text-primary" style={{ width: 3 + 'rem', height: 3 + 'rem' }} role={{ status }}>
                        <span className="sr-only"></span>
                    </div>
                </div>
            )}

            <div className="sidebar pe-4 pb-3">
                <nav className="navbar bg-secondary navbar-dark">
                    <a href="/" className="navbar-brand mx-4 mb-3">
                        {/* <h3 className="text-primary"><i className="fa fa-user-edit me-2"></i>UFG</h3> */}
                        <img src="./ufg_logo.png" alt='logo' style={{ width: 150 + "px" }} />
                    </a>
                    <div className="navbar-nav w-100">
                        <a href="/" className="nav-item nav-link "><i className="fa fa-tachometer-alt me-2"></i>Dashboard</a>
                        <a href="/relatorios" className="nav-item nav-link active"><i className="fa fa-th me-2"></i>Relatorio</a>
                    </div>
                </nav>
            </div>
            <div className="content">
                <div className="container-fluid pt-4 px-4">
                    <div className="row g-4">
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-line fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">CPU</p>
                                    <h6 className="mb-0">{cpuUsage}%</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-bar fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">RAM</p>
                                    <h6 className="mb-0">{memoryUsage}%</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-area fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">Disco</p>
                                    <h6 className="mb-0">{discoUsage}%</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4 text-center">
                                <i className="fa fa-chart-pie fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">CPU Nucleos</p>
                                    <h6 className="mb-0">{cpuNucleos}</h6>
                                </div>
                                <div className="ms-3">
                                    <p className="mb-2">Max Memoria Ram</p>
                                    <h6 className="mb-0">{maxMemoria.toFixed(2)} Gb</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container-fluid pt-4 px-4">
                    <div className="bg-secondary text-center rounded p-4">
                        <div id="chart1"></div>
                    </div>
                </div>
                <div className="container-fluid pt-4 px-4">
                    <div className="row g-4 text-center">
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-line fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">Tempo Médio de Resposta</p>
                                    <h6 className="mb-0">{TempoMedioResposta.toFixed(2)} s</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-bar fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">Sucess</p>
                                    <h6 className="mb-0">{sucessRequests}</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-line fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">Erros</p>
                                    <h6 className="mb-0">{errorRequests}</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-bar fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">Percentual Sucess</p>
                                    <h6 className="mb-0">{percSucess.toFixed(2)} %</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-bar fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">Maior Tempo</p>
                                    <h6 className="mb-0">{maxResponseTime.toFixed(2)} s</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-bar fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">Menor Tempo</p>
                                    <h6 className="mb-0">{minResponseTime.toFixed(2)} s</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-bar fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">Maior Uso Memoria</p>
                                    <h6 className="mb-0">{maxUsoMemoria.toFixed(2)} gb</h6>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-xl-3">
                            <div className="bg-secondary rounded d-flex align-items-center justify-content-between p-4">
                                <i className="fa fa-chart-bar fa-3x text-primary"></i>
                                <div className="ms-3">
                                    <p className="mb-2">Menor Uso Memoria</p>
                                    <h6 className="mb-0">{minUsoMemoria.toFixed(2)} gb</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container-fluid pt-4 px-4">
                    <div className="bg-secondary text-center rounded p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h6 className="mb-0">Lista de Requests</h6>
                        </div>
                        <div className="table-responsive">
                            <table className="table text-center align-middle table-bordered table-hover mb-0">
                                <thead>
                                    <tr className="text-white">
                                        <th scope="col">Indice</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Tempo</th>
                                        <th scope="col">Memória</th>
                                        <th scope="col">Cpu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedMetrics && sortedMetrics.map(x => (
                                        <tr key={x?.indice}>
                                            <td>{x?.indice}</td>
                                            <td>{x?.status}</td>
                                            <td>{x?.responseTime?.toFixed(2) + ' s'}</td>
                                            <td>{(x?.ramUsage / 1000000000)?.toFixed(2) + ' gb'}</td>
                                            <td>{x?.cpuUsage?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Relatorios
