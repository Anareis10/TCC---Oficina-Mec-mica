
const formulario = document.getElementById("formularioLogin");

formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    fetch("http://localhost:3000/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email: email,
            senha: senha
        })

    })

    .then(function(resposta) {
        return resposta.json();
    })

    .then(function(dados) {

        alert(dados.mensagem);

        if (dados.sucesso) {

            localStorage.setItem(
                "cliente",
                JSON.stringify(dados.cliente)
            );

            window.location.href = "index.html";
        }

    })

    .catch(function(erro) {
        console.log(erro);
        alert("Erro ao fazer login!");
    });

});
