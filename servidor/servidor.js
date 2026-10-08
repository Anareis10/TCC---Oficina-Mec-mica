const express =
require("express");
const cors = require("cors");

const banco = require("./banco");

const app = express();

app.use(cors());
app.use(express.json());

//CADASTRAR CLIENTE
app.post("/clientes", function(req, res) {
    const nome = req.body.nome;
    const ddd = req.body.ddd;
    const telefone = req.body.telefone;
    const email = req.body.email;
    const senha = req.body.senha;

    const sql = 'INSERT INTO Cliente (nome, DDD, telefone, email, senha) VALUES (?, ?, ?, ?, ?)';

    banco.query(sql, [nome, ddd, telefone, email, senha],
        function(erro, resultado) {
            if (erro) {
                console.log(erro);
                res.status(500).json({ mensagem: "Erro ao cadastrar cliente."});
                return;
            }
            res.json({
                mensagem: "Cliente cadastrado com sucesso!"
            });
        }
    );
});

// LOGIN
app.post("/login", function(req, res) {

    const email = req.body.email;
    const senha = req.body.senha;

    const sql = `
        SELECT * FROM cliente
        WHERE email = ? AND senha = ?
    `;

    banco.query(
        sql,
        [email, senha],
        function(erro, resultado) {

            if (erro) {
                console.log(erro);

                res.status(500).json({
                    mensagem: "Erro ao fazer login"
                });

                return;
            }

            if (resultado.length == 0) {

                res.json({
                    sucesso: false,
                    mensagem: "E-mail ou senha incorretos!"
                });

                return;
            }

            res.json({
                sucesso: true,
                mensagem: "Login realizado com sucesso!"
            });

        }
    );

});

// HISTÓRICO DO VEÍCULO
app.get("/historico", function(req, res) {

    const sql = `
        SELECT
            Agendamento.data_agendamento,
            Agendamento.data_horario,
            Veiculo.placa,
            Veiculo.marca,
            Veiculo.modelo,
            Servico.nome AS servico,
            Cliente.nome AS cliente
        FROM Agendamento
        INNER JOIN Veiculo
            ON Agendamento.id_veiculo = Veiculo.id_veiculo
        INNER JOIN Servico
            ON Agendamento.id_servico = Servico.id_servico
        INNER JOIN Cliente
            ON Veiculo.id_cliente = Cliente.id_cliente
    `;

    banco.query(sql, function(erro, resultado) {

        if (erro) {
            console.log(erro);

            res.status(500).json({
                mensagem: "Erro ao buscar histórico"
            });

            return;
        }

        res.json(resultado);
    });

});

// AGENDAMENTO
app.post("/agendamento", function(req, res) {

    const modelo = req.body.modelo;
    const placa = req.body.placa;
    const ano = req.body.ano;
    const servico = req.body.servico;
    const data = req.body.data;
    const horario = req.body.horario;

    // Cliente de teste
    const id_cliente = 1;

    // Primeiro procura o serviço escolhido
    const sqlServico = "SELECT id_servico FROM Servico WHERE nome = ?";

    banco.query(sqlServico, [servico], function(erro, resultado) {

        if (erro) {
            console.log(erro);

            res.status(500).json({
                mensagem: "Erro ao procurar o serviço."
            });

            return;
        }

        if (resultado.length == 0) {

            res.status(400).json({
                mensagem: "Serviço não encontrado."
            });

            return;
        }

        const id_servico = resultado[0].id_servico;

        // Cadastra o veículo
        const sqlVeiculo = `
            INSERT INTO Veiculo
            (id_cliente, placa, marca, modelo, ano, cor, carroceria, chassi, versao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        banco.query(
            sqlVeiculo,
            [
                id_cliente,
                placa,
                "Não informado",
                modelo,
                ano,
                "Não informado",
                "Não informado",
                "Não informado",
                "Não informado"
            ],
            function(erro, resultado) {

                if (erro) {
                    console.log(erro);

                    res.status(500).json({
                        mensagem: "Erro ao cadastrar veículo."
                    });

                    return;
                }

                const id_veiculo = resultado.insertId;

                // Cadastra o agendamento
                const sqlAgendamento = `
                    INSERT INTO Agendamento
                    (id_veiculo, id_servico, data_agendamento, data_horario)
                    VALUES (?, ?, ?, ?)
                `;

                banco.query(
                    sqlAgendamento,
                    [id_veiculo, id_servico, data, horario],
                    function(erro) {

                        if (erro) {
                            console.log(erro);

                            res.status(500).json({
                                mensagem: "Erro ao realizar agendamento."
                            });

                            return;
                        }

                        res.json({
                            mensagem: "Agendamento realizado com sucesso!"
                        });

                    }
                );
            }
        );
    });
});

app.listen(3000, function() {
    console.log("Servidor funcionando!");
});