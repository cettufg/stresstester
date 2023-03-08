var dataAtual = new Date();
export var meses = {
    1: "JANEIRO",
    2: "FEVEREIRO",
    3: "MARÇO",
    4: "ABRIL",
    5: "MAIO",
    6: "JUNHO",
    7: "JULHO",
    8: "AGOSTO",
    9: "SETEMBRO",
    10: "OUTUBRO",
    11: "NOVEMBRO",
    12: "DEZEMBRO",
};

export var dias = {
    0: "DOMINGO",
    1: "SEGUNDA-FEIRA",
    2: "TERÇA-FEIRA",
    3: "QUARTA-FEIRA",
    4: "QUINTA-FEIRA",
    5: "SEXTA-FEIRA",
    6: "SÁBADO",
};

export var info = {
    data: new Date(),
    dia: new Date().getDate(),
    weekday: dias[new Date().getDay()],
    mes: new Date().getMonth() + 1,
    mes2: meses[new Date().getMonth() + 1],
    ano: new Date().getFullYear(),
    hora: new Date().getHours(),
    minutos: new Date().getMinutes(),
    segundos: new Date().getSeconds(),
    timestamp: new Date().getTime(),
    update: function () {
        info.data = new Date();
        info.dia = info.data.getDate();
        info.weekday = dias[info.data.getDay()];
        info.mes = info.data.getMonth() + 1;
        info.mes2 = meses[info.data.getMonth() + 1];
        info.ano = info.data.getFullYear();
        info.hora = info.data.getHours();
        info.minutos = info.data.getMinutes();
        info.segundos = info.data.getSeconds();
        info.timestamp = info.data.getTime();
    },
};
