
const formulario = document.getElementById("formularioLogin");

const tipoLogin = document.getElementById("tipoLogin");
const areaCadastro = document.getElementById("areaCadastro");

// Mostra o cadastro e esqueci senha somente para clientes
if (tipoLogin && areaCadastro && recuperacao__senha) {
    tipoLogin.addEventListener("change", function () {
        if (tipoLogin.value === "admin") {
            areaCadastro.style.display = "none";
        } else {
            areaCadastro.style.display = "block";
        }
        if (tipoLogin.value === "admin"){
            recuperacao__senha.style.display = "none";
        }
        else {
            recuperacao__senha.style.display = "block";
        }
    });
}

if (formulario) {
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const tipo = tipoLogin.value;

        // Define a rota de acordo com o tipo de acesso
        const rota = tipo === "admin"
            ? "http://localhost:3000/admin/login"
            : "http://localhost:3000/login";

        try {
            const resposta = await fetch(rota, {
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

            if (!resposta.ok) {
                alert(dados.mensagem || "Erro ao fazer login.");
                return;
            }

            // LOGIN DO ADMINISTRADOR
            if (tipo === "admin") {

                if (!dados.sucesso || !dados.token) {
                    alert(dados.mensagem || "Não foi possível entrar.");
                    return;
                }

                sessionStorage.setItem("tokenAdmin", dados.token);

                sessionStorage.setItem(
                    "administrador",
                    JSON.stringify(dados.administrador)
                );

                alert("Bem-vindo ao painel administrativo!");

                window.location.href = "./pagina_adm.html";

                return;
            }

            // LOGIN DO CLIENTE
            if (!dados.sucesso || !dados.cliente) {
                alert(dados.mensagem || "Erro ao fazer login.");
                return;
            }

            localStorage.setItem(
                "cliente",
                JSON.stringify(dados.cliente)
            );

            alert(dados.mensagem);

            window.location.href = "./index.html";

        } catch (erro) {
            console.error("Erro no login:", erro);

            alert("Não foi possível conectar ao servidor.");
        }
    });
}
