
const formulario = document.getElementById("formularioCadastro");

if (formulario) {
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmaSenha = document.getElementById("confirmaSenha").value;

        if (senha !== confirmaSenha) {
            alert("As senhas não são iguais!");
            return;
        }

        try {
            const resposta = await fetch("http://localhost:3000/clientes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome,
                    telefone,
                    email,
                    senha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.mensagem || "Não foi possível realizar o cadastro.");
                return;
            }

            alert(dados.mensagem);
            window.location.href = "./login.html";

        } catch (erro) {
            console.error("Erro no cadastro:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
}
