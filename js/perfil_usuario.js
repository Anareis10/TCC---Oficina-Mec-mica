
const clienteSalvo = localStorage.getItem("cliente");

if (!clienteSalvo) {
    alert("Faça login para visualizar seu perfil!");
    window.location.href = "./login.html";
} else {
    const cliente = JSON.parse(clienteSalvo);

    async function carregarPerfil() {
        try {
            const resposta = await fetch(
                "http://localhost:3000/perfil/" + cliente.id_cliente
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || "Erro ao carregar perfil.");
            }

            document.getElementById("nome-usuario").textContent = dados.nome || "-";
            document.getElementById("email-usuario").textContent = dados.email || "-";

            document.getElementById("contato-usuario").textContent =
                dados.DDD && dados.telefone
                    ? "(" + dados.DDD + ") " + dados.telefone
                    : "-";

            document.getElementById("nome-cabecalho").textContent =
                dados.nome || "Usuário";

            document.getElementById("cliente-usuario").textContent =
                dados.id_cliente || "-";

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

            document.getElementById("motor-veiculo").textContent =
                dados.versao || "-";

            document.getElementById("combustivel-veiculo").textContent = "-";

        } catch (erro) {
            console.error("Erro ao carregar perfil:", erro);
            alert("Não foi possível carregar os dados do perfil.");
        }
    }

    carregarPerfil();
}
