const formulario = document.getElementById("formularioCadastro");

formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();

    const email = document.getElementById("email").value;
    const nome = document.getElementById("nome").value;
    const ddd = document.getElementById("ddd").value;
    const telefone = document.getElementById("telefone").value;
    const senha = document.getElementById("senha").value;
    const confirmaSenha = document.getElementById("confirmaSenha").value;

    if (senha != confirmaSenha) {
        alert("As senhas não são iguais!");
        return;
    }

    fetch("http://localhost:3000/clientes", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            nome: nome,
            ddd: ddd,
            telefone: telefone,
            email: email,
            senha: senha
        })

    })

    .then(function(resposta) {
        return resposta.json();
    })

    .then(function(dados) {

        alert(dados.mensagem);

        if (dados.mensagem == "Cliente cadastrado com sucesso!") {
            window.location.href = "login.html";
        }

    })

    .catch(function(erro) {
        console.log(erro);
        alert("Erro ao cadastrar!");
    });

});