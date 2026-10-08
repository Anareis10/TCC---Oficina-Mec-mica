const formulario = document.querySelector("form");

formulario.addEventListener("submit", async function(evento) {

    evento.preventDefault();

    const modelo = document.querySelector("#carModel").value;
    const placa = document.querySelector("#carPlate").value;
    const ano = document.querySelector("#carYear").value;
    const servico = document.querySelector("#carService").value;
    const data = document.querySelector("#data").value;
    const horario = document.querySelector("#horario").value;

    try {

        const resposta = await fetch("http://localhost:3000/agendamento", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                modelo: modelo,
                placa: placa,
                ano: ano,
                servico: servico,
                data: data,
                horario: horario
            })
        });

        const resultado = await resposta.json();

        alert(resultado.mensagem);

    } catch (erro) {

        console.log(erro);

        alert("Erro ao realizar o agendamento.");
    }

});