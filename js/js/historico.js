fetch("http://localhost:3000/historico")

    .then(function(resposta) {
        return resposta.json();
    })

    .then(function(historicos) {

        const barras = document.querySelectorAll(".barra__editar");
        const formularios = document.querySelectorAll(".formulario");

        historicos.forEach(function(historico, indice) {

            if (indice >= formularios.length) {
                return;
            }

            const data = new Date(historico.data_agendamento);

            const dataFormatada = data.toLocaleDateString("pt-BR");

            // Coloca a data na barra laranja
            barras[indice].textContent = dataFormatada;

            // Pega o formulário correspondente
            const formulario = formularios[indice];

            // Coloca as informações nos campos
            formulario.querySelectorAll("p")[0].innerHTML =
                "<span>Veículo: </span>" +
                historico.marca + " " +
                historico.modelo +
                " - " +
                historico.placa;

            formulario.querySelectorAll("p")[1].innerHTML =
                "<span>Tipo de serviço: </span>" +
                historico.servico;

            formulario.querySelectorAll("p")[2].innerHTML =
                "<span>Cliente: </span>" +
                historico.cliente;

            formulario.querySelectorAll("p")[3].innerHTML =
                "<span>Descrição: </span>" +
                "Serviço agendado";

            formulario.querySelectorAll("p")[4].innerHTML =
                "<span>Responsável: </span>" +
                "Paulo Car";

            formulario.querySelectorAll("p")[5].innerHTML =
                "<span>Observação: </span>" +
                "Não informado";

        });

    })

    .catch(function(erro) {

        console.log(erro);

        alert("Erro ao carregar o histórico.");

    });