
const API = "http://localhost:3000";

// VERIFICAR AUTENTICAÇÃO DO ADMINISTRADOR

const tokenAdmin = sessionStorage.getItem("tokenAdmin");

if (!tokenAdmin) {
    alert("Você precisa fazer login como administrador.");
    window.location.href = "./login.html";
}

// Cabeçalho de autenticação
function cabecalhoAdmin() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenAdmin}`
    };
}

const nomeStatus = {
    pendente: "Pendente",
    andamento: "Em andamento",
    concluido: "Concluído",
    cancelado: "Cancelado"
};

const nomeServico = {
    "Modulo": "Módulo",
    "ABS": "ABS",
    "Airbag": "Airbag",
    "Injeção Eletrônica": "Injeção Eletrônica",
    "Motores": "Motores",
    "Outros": "Outros"
};

const linhas = document.getElementById("linhas");
const campoBusca = document.getElementById("buscar");
const campoStatus = document.getElementById("status");
const campoDia = document.getElementById("dia");
const contador = document.getElementById("quant__veiculo");
const tituloAgenda = document.getElementById("titulo__agenda__texto");

const botaoStatus = document.getElementById("atualizar__status");
const janelaStatus = document.getElementById("modal__status");
const seletorStatus = document.getElementById("novo__status");
const textoJanela = document.getElementById("modal__cliente");

const janelaNovo = document.getElementById("modal__novo");
const formNovo = document.getElementById("form__novo");

let agendamentos = [];
let selecionado = null;

// DATA ATUAL NO FUSO LOCAL
function dataISO(data = new Date()) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarData(iso) {
    if (!iso) return "-";

    const partes = String(iso).slice(0, 10).split("-");

    if (partes.length !== 3) return iso;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function atualizarDataHoje() {
    const hoje = new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const campoDataHoje = document.getElementById("data-hoje");

    campoDataHoje.textContent =
        hoje.charAt(0).toUpperCase() + hoje.slice(1);
}

// CARREGAR AGENDAMENTOS DO BANCO
async function carregarAgendamentos() {
    try {
        linhas.innerHTML = `
            <tr>
                <td colspan="6" class="vazio">Carregando agendamentos...</td>
            </tr>
        `;

        const resposta = await fetch(`${API}/admin/agendamentos`, {
        headers: cabecalhoAdmin()
        });
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao carregar agenda.");
        }

        agendamentos = dados.map(item => ({
            ...item,
            data: String(item.data).slice(0, 10),
            horario: String(item.horario).slice(0, 5)
        }));

        agendamentos.sort((a, b) => {
            return (a.data + a.horario).localeCompare(b.data + b.horario);
        });

        mostrarAgenda();

    } catch (erro) {
        console.error("Erro ao carregar agendamentos:", erro);

        linhas.innerHTML = `
            <tr>
                <td colspan="6" class="vazio">
                    Não foi possível carregar os agendamentos.
                </td>
            </tr>
        `;

        alert(erro.message);
    }
}

// MOSTRAR DETALHES DO CLIENTE E DO VEÍCULO
function mostrarDetalhes(item) {
    if (!item) return;

    selecionado = item.id_agendamento;

    document.getElementById("nome").textContent = item.cliente || "-";
    document.getElementById("email").textContent = item.email || "-";
    document.getElementById("telefone").textContent = item.telefone || "-";
    document.getElementById("marca").textContent = item.marca || "-";
    document.getElementById("modelo").textContent = item.modelo || "-";
    document.getElementById("ano").textContent = item.ano || "-";
    document.getElementById("placa").textContent = item.placa || "-";

    linhas.querySelectorAll("tr[data-id]").forEach(tr => {
        tr.classList.toggle(
            "selecionada",
            Number(tr.dataset.id) === Number(item.id_agendamento)
        );
    });
}

// CRIAR CÉLULA DA TABELA
function criarCelula(texto, classe = "") {
    const td = document.createElement("td");

    td.textContent = texto || "-";

    if (classe) {
        td.className = classe;
    }

    return td;
}

// MOSTRAR AGENDA COM FILTROS
function mostrarAgenda() {
    const hojeISO = dataISO();

    if (!campoDia.value) {
        campoDia.value = hojeISO;
    }

    const busca = campoBusca.value.trim().toLowerCase();
    const buscando = busca !== "";
    const filtro = campoStatus.value;

    const dataSelecionada = campoDia.value;

    tituloAgenda.textContent = buscando
        ? "Resultados da busca"
        : dataSelecionada === hojeISO
            ? "Agenda de hoje"
            : `Agenda de ${formatarData(dataSelecionada)}`;

    campoDia.classList.toggle("inativo", buscando);

    linhas.innerHTML = "";

    const filtrados = agendamentos.filter(item => {
        if (!buscando && item.data !== dataSelecionada) {
            return false;
        }

        if (filtro && item.status !== filtro) {
            return false;
        }

        if (buscando) {
            const textoBusca =
                `${item.cliente} ${item.placa}`.toLowerCase();

            if (!textoBusca.includes(busca)) {
                return false;
            }
        }

        return true;
    });

    contador.textContent = filtrados.length;

    if (filtrados.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 6;
        td.className = "vazio";
        td.textContent = buscando
            ? "Nenhum resultado para a busca."
            : "Nenhum agendamento para este dia.";

        tr.appendChild(td);
        linhas.appendChild(tr);

        selecionado = null;

        document.getElementById("nome").textContent = "-";
        document.getElementById("email").textContent = "-";
        document.getElementById("telefone").textContent = "-";
        document.getElementById("marca").textContent = "-";
        document.getElementById("modelo").textContent = "-";
        document.getElementById("ano").textContent = "-";
        document.getElementById("placa").textContent = "-";

        return;
    }

    filtrados.forEach(item => {
        const tr = document.createElement("tr");

        tr.dataset.id = item.id_agendamento;

        tr.appendChild(criarCelula(formatarData(item.data)));
        tr.appendChild(criarCelula(item.horario));

        tr.appendChild(criarCelula(item.cliente));

        const tdVeiculo = document.createElement("td");
        tdVeiculo.appendChild(document.createTextNode(item.modelo || "-"));

        const spanPlaca = document.createElement("span");
        spanPlaca.className = "placa";
        spanPlaca.textContent = item.placa || "-";

        tdVeiculo.appendChild(spanPlaca);
        tr.appendChild(tdVeiculo);

        tr.appendChild(
            criarCelula(nomeServico[item.servico] || item.servico)
        );

        const tdStatus = document.createElement("td");
        const etiqueta = document.createElement("span");

        etiqueta.className = `etiqueta ${item.status}`;
        etiqueta.textContent = nomeStatus[item.status] || item.status;

        tdStatus.appendChild(etiqueta);
        tr.appendChild(tdStatus);

        tr.addEventListener("click", function () {
            mostrarDetalhes(item);
        });

        linhas.appendChild(tr);
    });

    const itemSelecionado = filtrados.find(
        item => Number(item.id_agendamento) === Number(selecionado)
    );

    mostrarDetalhes(itemSelecionado || filtrados[0]);
}

// EVENTOS DOS FILTROS
campoBusca.addEventListener("input", mostrarAgenda);
campoStatus.addEventListener("change", mostrarAgenda);
campoDia.addEventListener("change", mostrarAgenda);

// ABRIR JANELA DE STATUS
botaoStatus.addEventListener("click", function () {
    if (!selecionado) {
        alert("Selecione um agendamento primeiro.");
        return;
    }

    const item = agendamentos.find(
        agendamento =>
            Number(agendamento.id_agendamento) === Number(selecionado)
    );

    if (!item) return;

    textoJanela.textContent =
        `${item.cliente} · ${item.modelo} (${item.placa})`;

    seletorStatus.value = item.status;

    janelaStatus.showModal();
});

// CANCELAR ALTERAÇÃO DE STATUS
document.getElementById("cancelar__status").addEventListener("click", function () {
    janelaStatus.close();
});

// SALVAR STATUS NO BANCO
document.getElementById("salvar__status").addEventListener("click", async function () {
    if (!selecionado) return;

    const novoStatus = seletorStatus.value;

    try {
        const resposta = await fetch(
            `${API}/admin/agendamentos/${selecionado}/status`,
            {
                method: "PATCH",
                headers: cabecalhoAdmin(),
                body: JSON.stringify({
                    status: novoStatus
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao atualizar status.");
        }

        janelaStatus.close();

        await carregarAgendamentos();

        alert("Status atualizado com sucesso!");

    } catch (erro) {
        console.error(erro);
        alert(erro.message);
    }
});

// ABRIR NOVO AGENDAMENTO
document.getElementById("novo__agendamento").addEventListener("click", function () {
    formNovo.reset();

    document.getElementById("n-data").value =
        campoDia.value || dataISO();

    janelaNovo.showModal();
});

// FECHAR NOVO AGENDAMENTO
document.getElementById("cancelar__novo").addEventListener("click", function () {
    janelaNovo.close();
});

// CADASTRAR AGENDAMENTO PELO ADMINISTRADOR
formNovo.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const novo = {
        cliente: document.getElementById("n-cliente").value.trim(),
        telefone: document.getElementById("n-telefone").value.trim(),
        email: document.getElementById("n-email").value.trim(),
        marca: document.getElementById("n-marca").value.trim(),
        modelo: document.getElementById("n-modelo").value.trim(),
        ano: document.getElementById("n-ano").value,
        placa: document.getElementById("n-placa").value.trim().toUpperCase(),
        servico: document.getElementById("n-servico").value,
        data: document.getElementById("n-data").value,
        horario: document.getElementById("n-horario").value,
        status: document.getElementById("n-status").value
    };

    try {
        const resposta = await fetch(`${API}/admin/agendamentos`, {
            method: "POST",
            headers: cabecalhoAdmin(),
            body: JSON.stringify(novo)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao cadastrar agendamento.");
        }

        janelaNovo.close();

        campoBusca.value = "";
        campoStatus.value = "";
        campoDia.value = novo.data;

        selecionado = dados.id_agendamento;

        await carregarAgendamentos();

        alert(dados.mensagem || "Agendamento cadastrado com sucesso!");

    } catch (erro) {
        console.error("Erro ao cadastrar agendamento:", erro);
        alert(erro.message);
    }
});

// INICIALIZAÇÃO
atualizarDataHoje();

campoDia.value = dataISO();

carregarAgendamentos();
