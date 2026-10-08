fetch("http://localhost:3000/historico")

    .then(function(resposta) {
        return resposta.json();
    })

    .then(function(dados) {

        console.log(dados);

    })

    .catch(function(erro) {
        console.log(erro);
    });