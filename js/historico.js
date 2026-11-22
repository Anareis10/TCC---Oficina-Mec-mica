
const clienteSalvo = localStorage.getItem("cliente");

if (!clienteSalvo) {
    alert("Faça login para visualizar seu histórico!");
    window.location.href = "./login.html";
} else {
    const cliente = JSON.parse(clienteSalvo);

    async function carregarHistorico() {
        try {
            const resposta = await fetch(
                "http://localhost:3000/historico/" + cliente.id_cliente
            );

            const historicos = await resposta.json();

            if (!resposta.ok) {
                throw new Error(historicos.mensagem || "Erro ao buscar histórico.");
            }

            const formularios = document.querySelectorAll(".formulario");
            const barras = document.querySelectorAll(".barra__editar");

            if (historicos.length === 0) {
                formularios.forEach(function (formulario) {
                    formulario.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
                });
                return;
            }

            historicos.forEach(function (historico, indice) {
                if (indice >= formularios.length) return;

                const formulario = formularios[indice];
                const barra = barras[indice];

                const data = new Date(
                    historico.data_agendamento + "T00:00:00"
                );

                const dataFormatada = data.toLocaleDateString("pt-BR");

                if (barra) {
                    barra.textContent = "Agendamento - " + dataFormatada;
                }

                const horario = String(historico.data_horario).substring(0, 5);

                formulario.innerHTML = `
                    <p><span>Data:</span> ${dataFormatada}</p>
                    <hr>
                    <p><span>Horário:</span> ${horario}</p>
                    <hr>
                    <p><span>Veículo:</span> ${historico.marca} ${historico.modelo}</p>
                    <hr>
                    <p><span>Placa:</span> ${historico.placa}</p>
                    <hr>
                    <p><span>Serviço:</span> ${historico.servico}</p>
                    <hr>
                    <p><span>Cliente:</span> ${historico.cliente}</p>
                `;
            });

        } catch (erro) {
            console.error("Erro ao carregar histórico:", erro);
            alert("Não foi possível carregar o histórico.");
        }
    }

    carregarHistorico();
}
