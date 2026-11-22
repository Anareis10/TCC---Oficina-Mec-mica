
const express = require("express");
const cors = require("cors");
const banco = require("./banco");

const app = express();

app.use(cors());
app.use(express.json());

const PORTA = 3000;

// SERVIÇOS CADASTRADOS NO BANCO
const servicos = {
    "Modulo": "Modulo",
    "ABS": "ABS",
    "airbag": "Airbag",
    "injecaoEletronica": "Injeção Eletrônica",
    "motores": "Motores",
    "others": "Outros"
};

// CADASTRAR CLIENTE
app.post("/clientes", function (req, res) {
    const { nome, telefone, email, senha } = req.body;

    if (!nome || !telefone || !email || !senha) {
        return res.status(400).json({
            mensagem: "Preencha todos os campos."
        });
    }

    // O campo telefone deve conter DDD + número.
    const numeros = String(telefone).replace(/\D/g, "");

    if (numeros.length !== 10 && numeros.length !== 11) {
        return res.status(400).json({
            mensagem: "Informe o telefone com DDD."
        });
    }

    const ddd = numeros.substring(0, 2);
    const numeroTelefone = numeros.substring(2);

    const sql = `
        INSERT INTO Cliente
        (nome, DDD, telefone, email, senha)
        VALUES (?, ?, ?, ?, ?)
    `;

    banco.query(
        sql,
        [nome, ddd, numeroTelefone, email, senha],
        function (erro) {
            if (erro) {
                console.error("Erro no cadastro:", erro);

                if (erro.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensagem: "Este e-mail já está cadastrado."
                    });
                }

                return res.status(500).json({
                    mensagem: "Erro ao cadastrar cliente."
                });
            }

            res.status(201).json({
                mensagem: "Cliente cadastrado com sucesso!"
            });
        }
    );
});

// LOGIN
app.post("/login", function (req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Informe o e-mail e a senha."
        });
    }

    const sql = `
        SELECT id_cliente, nome, email, DDD, telefone
        FROM Cliente
        WHERE email = ? AND senha = ?
    `;

    banco.query(sql, [email, senha], function (erro, resultado) {
        if (erro) {
            console.error("Erro no login:", erro);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao fazer login."
            });
        }

        if (resultado.length === 0) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "E-mail ou senha incorretos!"
            });
        }

        res.json({
            sucesso: true,
            mensagem: "Login realizado com sucesso!",
            cliente: resultado[0]
        });
    });
});

// PERFIL DO CLIENTE
app.get("/perfil/:id_cliente", function (req, res) {
    const idCliente = req.params.id_cliente;

    const sql = `
        SELECT
            c.id_cliente,
            c.nome,
            c.email,
            c.DDD,
            c.telefone,
            v.marca,
            v.modelo,
            v.placa,
            v.Ano AS ano,
            v.Cor AS cor,
            v.Carroceria AS carroceria,
            v.chassi,
            v.versao
        FROM Cliente c
        LEFT JOIN Veiculo v
            ON c.id_cliente = v.id_cliente
        WHERE c.id_cliente = ?
        ORDER BY v.id_veiculo DESC
        LIMIT 1
    `;

    banco.query(sql, [idCliente], function (erro, resultado) {
        if (erro) {
            console.error("Erro ao buscar perfil:", erro);

            return res.status(500).json({
                mensagem: "Erro ao buscar perfil."
            });
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        res.json(resultado[0]);
    });
});

// HISTÓRICO DO CLIENTE
app.get("/historico/:id_cliente", function (req, res) {
    const idCliente = req.params.id_cliente;

    const sql = `
        SELECT
            a.id_agendamento,
            a.data_agendamento,
            a.data_horario,
            v.placa,
            v.marca,
            v.modelo,
            s.nome AS servico,
            c.nome AS cliente
        FROM Agendamento a
        INNER JOIN Veiculo v
            ON a.id_veiculo = v.id_veiculo
        INNER JOIN Servico s
            ON a.id_servico = s.id_servico
        INNER JOIN Cliente c
            ON v.id_cliente = c.id_cliente
        WHERE c.id_cliente = ?
        ORDER BY a.data_agendamento DESC, a.data_horario DESC
    `;

    banco.query(sql, [idCliente], function (erro, resultado) {
        if (erro) {
            console.error("Erro ao buscar histórico:", erro);

            return res.status(500).json({
                mensagem: "Erro ao buscar histórico."
            });
        }

        res.json(resultado);
    });
});

// AGENDAMENTO
app.post("/agendamento", function (req, res) {
    const {
        id_cliente,
        marca,
        modelo,
        motor,
        carroceria,
        placa,
        ano,
        cor,
        combustivel,
        chassi,
        servico,
        data,
        horario
    } = req.body;

    if (
        !id_cliente || !marca || !modelo || !carroceria ||
        !placa || !ano || !cor || !chassi ||
        !servico || !data || !horario
    ) {
        return res.status(400).json({
            mensagem: "Preencha todos os dados obrigatórios do agendamento."
        });
    }

    const nomeServico = servicos[servico] || servico;

    const sqlCliente = `
        SELECT id_cliente
        FROM Cliente
        WHERE id_cliente = ?
    `;

    banco.query(sqlCliente, [id_cliente], function (erro, clientes) {
        if (erro) {
            console.error(erro);

            return res.status(500).json({
                mensagem: "Erro ao verificar o cliente."
            });
        }

        if (clientes.length === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado. Faça login novamente."
            });
        }

        const sqlServico = `
            SELECT id_servico
            FROM Servico
            WHERE nome = ?
        `;

        banco.query(sqlServico, [nomeServico], function (erro, servicosEncontrados) {
            if (erro) {
                console.error(erro);

                return res.status(500).json({
                    mensagem: "Erro ao procurar o serviço."
                });
            }

            if (servicosEncontrados.length === 0) {
                return res.status(404).json({
                    mensagem: "Serviço não encontrado no banco de dados."
                });
            }

            const idServico = servicosEncontrados[0].id_servico;

            const sqlVeiculo = `
                INSERT INTO Veiculo
                (
                    id_cliente,
                    placa,
                    marca,
                    modelo,
                    Ano,
                    Cor,
                    Carroceria,
                    chassi,
                    versao
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            banco.query(
                sqlVeiculo,
                [
                    id_cliente,
                    placa,
                    marca,
                    modelo,
                    ano,
                    cor,
                    carroceria,
                    chassi,
                    motor || "Não informado"
                ],
                function (erro, resultadoVeiculo) {
                    if (erro) {
                        console.error("Erro ao cadastrar veículo:", erro);

                        return res.status(500).json({
                            mensagem: "Erro ao cadastrar veículo."
                        });
                    }

                    const idVeiculo = resultadoVeiculo.insertId;

                    const sqlAgendamento = `
                        INSERT INTO Agendamento
                        (
                            id_veiculo,
                            id_servico,
                            data_agendamento,
                            data_horario
                        )
                        VALUES (?, ?, ?, ?)
                    `;

                    banco.query(
                        sqlAgendamento,
                        [idVeiculo, idServico, data, horario],
                        function (erro) {
                            if (erro) {
                                console.error("Erro ao salvar agendamento:", erro);

                                return res.status(500).json({
                                    mensagem: "Veículo cadastrado, mas não foi possível salvar o agendamento."
                                });
                            }

                            res.status(201).json({
                                mensagem: "Agendamento realizado com sucesso!"
                            });
                        }
                    );
                }
            );
        });
    });
});

app.listen(PORTA, function () {
    console.log("Servidor funcionando na porta " + PORTA);
});
