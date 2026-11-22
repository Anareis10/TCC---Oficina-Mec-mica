
const formulario = document.getElementById("formularioLogin");

if (formulario) {
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        try {
            const resposta = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    senha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok || !dados.sucesso) {
                alert(dados.mensagem || "Erro ao fazer login.");
                return;
            }

            localStorage.setItem("cliente", JSON.stringify(dados.cliente));

            alert(dados.mensagem);
            window.location.href = "./index.html";

        } catch (erro) {
            console.error("Erro no login:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
}
