
const clienteSalvo = localStorage.getItem("cliente");

if (!clienteSalvo) {

    alert("Faça login para visualizar seu perfil!");
    window.location.href = "./login.html";

} else {

    const cliente = JSON.parse(clienteSalvo);

    // MOSTRAR OS DADOS DA CONTA
    document.getElementById("nome-usuario").textContent =
        cliente.nome || "-";

    document.getElementById("email-usuario").textContent =
        cliente.email || "-";

    document.getElementById("contato-usuario").textContent =
        cliente.DDD && cliente.telefone
            ? "(" + cliente.DDD + ") " + cliente.telefone
            : "-";

    document.getElementById("nome-cabecalho").textContent =
        cliente.nome || "Usuário";

    // BUSCAR OS DADOS DO BANCO
    fetch("http://localhost:3000/perfil/" + cliente.id_cliente)

        .then(function(resposta) {

            if (!resposta.ok) {
                throw new Error("Erro ao buscar os dados do perfil.");
            }

            return resposta.json();

        })

        .then(function(dados) {

            // DADOS DA CONTA
            document.getElementById("nome-usuario").textContent =
                dados.nome || "-";

            document.getElementById("email-usuario").textContent =
                dados.email || "-";

            document.getElementById("contato-usuario").textContent =
                dados.DDD && dados.telefone
                    ? "(" + dados.DDD + ") " + dados.telefone
                    : "-";

            document.getElementById("nome-cabecalho").textContent =
                dados.nome || "Usuário";

            document.getElementById("cliente-usuario").textContent =
                dados.id_cliente || "-";

            // DADOS DO VEÍCULO
            document.getElementById("marca-veiculo").textContent =
                dados.marca || "-";

            document.getElementById("modelo-veiculo").textContent =
                dados.modelo || "-";

            document.getElementById("placa-veiculo").textContent =
                dados.placa || "-";

            document.getElementById("ano-veiculo").textContent =
                dados.ano || "-";

            document.getElementById("cor-veiculo").textContent =
                dados.cor || "-";

            document.getElementById("carroceria-veiculo").textContent =
                dados.carroceria || "-";

            document.getElementById("chassi-veiculo").textContent =
                dados.chassi || "-";

            // ESTES CAMPOS AINDA NÃO EXISTEM NA TABELA
            document.getElementById("motor-veiculo").textContent = "-";

            document.getElementById("combustivel-veiculo").textContent = "-";

        })

        .catch(function(erro) {
            console.log("Erro ao carregar perfil:", erro);
            alert("Não foi possível carregar os dados do perfil.");
        });

}
