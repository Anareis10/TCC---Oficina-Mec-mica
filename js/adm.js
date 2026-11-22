
function dataISO(d) {
    var mes = String(d.getMonth() + 1).padStart(2, "0");
    var dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mes + "-" + dia;
}

function somarDias(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return dataISO(d);
}

function formatarData(iso) {
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
}

var hojeISO = dataISO(new Date());


var hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
});
document.getElementById("data-hoje").textContent =
    hoje.charAt(0).toUpperCase() + hoje.slice(1);

//Dados de exemplo (depois virão do banco de dados)
var agendamentos = [
    { data: hojeISO,      horario: "08:00", cliente: "Carlos Almeida", email: "carlos.almeida@email.com", telefone: "(19) 99812-3344", marca: "Volkswagen", modelo: "Gol 1.6",          ano: "2016", placa: "FQX-4B21", servico: "injecaoEletronica", status: "concluido" },
    { data: hojeISO,      horario: "09:30", cliente: "Fernanda Souza", email: "fe.souza@email.com",       telefone: "(19) 98126-5407", marca: "Chevrolet",  modelo: "Onix LT",          ano: "2019", placa: "GHT-9C07", servico: "ABS",               status: "andamento" },
    { data: hojeISO,      horario: "11:00", cliente: "Marcos Pereira", email: "marcos.p@email.com",       telefone: "(19) 99700-1188", marca: "Fiat",       modelo: "Strada Endurance", ano: "2021", placa: "RTA-2D55", servico: "Modulo",            status: "pendente"  },
    { data: hojeISO,      horario: "14:00", cliente: "Juliana Rocha",  email: "ju.rocha@email.com",       telefone: "(19) 99655-2290", marca: "Honda",      modelo: "Civic EXL",        ano: "2018", placa: "EQM-7F90", servico: "airbag",            status: "pendente"  },
    { data: hojeISO,      horario: "15:30", cliente: "Roberto Lima",   email: "roberto.lima@email.com",   telefone: "(19) 98877-4521", marca: "Toyota",     modelo: "Corolla XEi",      ano: "2020", placa: "JKL-1A34", servico: "motores",           status: "cancelado" },
    { data: somarDias(1), horario: "10:00", cliente: "Patrícia Gomes", email: "patricia.g@email.com",     telefone: "(19) 99123-4567", marca: "Hyundai",    modelo: "HB20",             ano: "2022", placa: "MNB-3E88", servico: "ABS",               status: "pendente"  }
];

var nomeStatus = {
    pendente: "Pendente",
    andamento: "Em andamento",
    concluido: "Concluído",
    cancelado: "Cancelado"
};

//
var nomeServico = {
    Modulo: "Módulo",
    ABS: "ABS",
    airbag: "Airbag",
    injecaoEletronica: "Injeção Eletrônica",
    motores: "Motores",
    others: "Outros"
};


var linhas = document.getElementById("linhas");
var campoBusca = document.getElementById("buscar");
var campoStatus = document.getElementById("status");
var campoDia = document.getElementById("dia");
var contador = document.getElementById("quant__veiculo");
var tituloAgenda = document.getElementById("titulo__agenda__texto");

campoDia.value = hojeISO; 

var selecionado = 0;

//Preenche os cards de cliente e veículo
function mostrarDetalhes(i) {
    var item = agendamentos[i];
    selecionado = i;

    document.getElementById("nome").textContent = item.cliente;
    document.getElementById("email").textContent = item.email;
    document.getElementById("telefone").textContent = item.telefone;
    document.getElementById("marca").textContent = item.marca;
    document.getElementById("modelo").textContent = item.modelo;
    document.getElementById("ano").textContent = item.ano;
    document.getElementById("placa").textContent = item.placa;

    
    linhas.querySelectorAll("tr[data-indice]").forEach(function (tr) {
        tr.classList.toggle("selecionada", Number(tr.dataset.indice) === i);
    });
}


function mostrarAgenda() {
    var busca = campoBusca.value.trim().toLowerCase();
    var buscando = busca !== "";
    var filtro = campoStatus.value;
    var total = 0;
    var primeiroVisivel = -1;
    var selecionadoVisivel = false;

    if (!campoDia.value) campoDia.value = hojeISO;


    if (buscando) {
        tituloAgenda.textContent = "Resultados da busca";
    } else {
        tituloAgenda.textContent = campoDia.value === hojeISO
            ? "Agenda de hoje"
            : "Agenda de " + formatarData(campoDia.value);
    }

    
    campoDia.classList.toggle("inativo", buscando);

    linhas.innerHTML = "";

    agendamentos.forEach(function (item, i) {
        
        if (!buscando && item.data !== campoDia.value) return;

        if (filtro && item.status !== filtro) return;

        if (buscando && (item.cliente + " " + item.placa).toLowerCase().indexOf(busca) < 0) return;

        var tr = document.createElement("tr");
        tr.dataset.indice = i;
        tr.innerHTML =
            '<td data-label="Data">' + formatarData(item.data) + "</td>" +
            '<td data-label="Horário"><b>' + item.horario + "</b></td>" +
            '<td data-label="Cliente">' + item.cliente + "</td>" +
            '<td data-label="Veículo">' + item.modelo + '<span class="placa">' + item.placa + "</span></td>" +
            '<td data-label="Serviço">' + nomeServico[item.servico] + "</td>" +
            '<td data-label="Status"><span class="etiqueta ' + item.status + '">' + nomeStatus[item.status] + "</span></td>";

        tr.addEventListener("click", function () {
            mostrarDetalhes(i);
        });

        linhas.appendChild(tr);
        total++;

        if (primeiroVisivel < 0) primeiroVisivel = i;
        if (i === selecionado) selecionadoVisivel = true;
    });

    contador.textContent = total;

    if (total === 0) {
        linhas.innerHTML = '<tr><td colspan="6" class="vazio">' +
            (buscando ? "Nenhum resultado para a busca." : "Nenhum agendamento para este dia.") +
            "</td></tr>";
        return;
    }


    mostrarDetalhes(selecionadoVisivel ? selecionado : primeiroVisivel);
}

campoBusca.addEventListener("input", mostrarAgenda);
campoStatus.addEventListener("change", mostrarAgenda);
campoDia.addEventListener("change", mostrarAgenda);


var botaoStatus = document.getElementById("atualizar__status");
var janela = document.getElementById("modal__status");
var seletorStatus = document.getElementById("novo__status");
var textoJanela = document.getElementById("modal__cliente");


botaoStatus.addEventListener("click", function () {
    if (!linhas.querySelector("tr[data-indice]")) return;

    var item = agendamentos[selecionado];
    textoJanela.textContent = item.cliente + " · " + item.modelo + " (" + item.placa + ")";
    seletorStatus.value = item.status;       
    janela.showModal();
});

document.getElementById("cancelar__status").addEventListener("click", function () {
    janela.close();
});


document.getElementById("salvar__status").addEventListener("click", function () {
    agendamentos[selecionado].status = seletorStatus.value;

    // Quando tiver back-end, envie a mudança aqui, por exemplo:
    // fetch("/api/agendamentos/" + agendamentos[selecionado].id, {
    //     method: "PATCH",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ status: seletorStatus.value })
    // });

    janela.close();
    mostrarAgenda();
});

//Novo agendamento
var janelaNovo = document.getElementById("modal__novo");
var formNovo = document.getElementById("form__novo");

document.getElementById("novo__agendamento").addEventListener("click", function () {
    formNovo.reset();
    document.getElementById("n-data").value = campoDia.value;  
    janelaNovo.showModal();
});

document.getElementById("cancelar__novo").addEventListener("click", function () {
    janelaNovo.close();
});

formNovo.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var novo = {
        data:     document.getElementById("n-data").value,
        horario:  document.getElementById("n-horario").value,
        cliente:  document.getElementById("n-cliente").value.trim(),
        email:    document.getElementById("n-email").value.trim() || "-",
        telefone: document.getElementById("n-telefone").value.trim(),
        marca:    document.getElementById("n-marca").value.trim(),
        modelo:   document.getElementById("n-modelo").value.trim(),
        ano:      document.getElementById("n-ano").value,
        placa:    document.getElementById("n-placa").value.trim().toUpperCase(),
        servico:  document.getElementById("n-servico").value,
        status:   document.getElementById("n-status").value
    };

    // Quando tiver back-end, envie o novo agendamento aqui, por exemplo:
    // fetch("/api/agendamentos", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(novo)
    // });

    agendamentos.push(novo);
    agendamentos.sort(function (a, b) {
        return (a.data + a.horario).localeCompare(b.data + b.horario);
    });


    campoBusca.value = "";
    campoStatus.value = "";
    campoDia.value = novo.data;
    selecionado = agendamentos.indexOf(novo);

    janelaNovo.close();
    mostrarAgenda();
});

mostrarAgenda();