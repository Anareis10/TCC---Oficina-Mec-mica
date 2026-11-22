
const formulario = document.querySelector("form");

if (formulario) {
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const clienteSalvo = localStorage.getItem("cliente");

        if (!clienteSalvo) {
            alert("Faça login antes de realizar um agendamento.");
            window.location.href = "./login.html";
            return;
        }

        const cliente = JSON.parse(clienteSalvo);

        const dados = {
            id_cliente: cliente.id_cliente,
            marca: document.getElementById("carMarca").value.trim(),
            modelo: document.getElementById("carModel").value.trim(),
            motor: document.getElementById("carMotor").value.trim(),
            carroceria: document.getElementById("carCarroceria").value.trim(),
            placa: document.getElementById("carPlate").value.trim(),
            ano: document.getElementById("carYear").value.trim(),
            cor: document.getElementById("carColor").value.trim(),
            combustivel: document.getElementById("carCombustivel").value.trim(),
            chassi: document.getElementById("carChassi").value.trim(),
            servico: document.getElementById("carService").value,
            data: document.getElementById("data").value,
            horario: document.getElementById("horario").value
        };

        try {
            const resposta = await fetch("http://localhost:3000/agendamento", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                alert(resultado.mensagem || "Erro ao realizar o agendamento.");
                return;
            }

            alert(resultado.mensagem);
            formulario.reset();

        } catch (erro) {
            console.error("Erro no agendamento:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
}
