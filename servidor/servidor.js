
const express = require("express");
const cors = require("cors");
const banco = require("./banco");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const db = banco.promise();

app.use(cors());
app.use(express.json());

const PORTA = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Configure a variável JWT_SECRET antes de iniciar o servidor.");
}

const servicos = {
    Modulo: "Modulo",
    ABS: "ABS",
    airbag: "Airbag",
    injecaoEletronica: "Injeção Eletrônica",
    motores: "Motores",
    others: "Outros"
};

const statusPermitidos = [
    "pendente",
    "andamento",
    "concluido",
    "cancelado"
];

// ==========================================
// CADASTRAR CLIENTE
// ==========================================

app.post("/clientes", async function (req, res) {
    try {
        const { nome, telefone, email, senha } = req.body;

        if (!nome || !telefone || !email || !senha) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos."
            });
        }

        const numeros = String(telefone).replace(/\D/g, "");

        if (numeros.length !== 10 && numeros.length !== 11) {
            return res.status(400).json({
                mensagem: "Informe o telefone com DDD."
            });
        }

        const ddd = numeros.substring(0, 2);
        const numeroTelefone = numeros.substring(2);

        await db.query(
            `INSERT INTO Cliente (nome, DDD, telefone, email, senha)
             VALUES (?, ?, ?, ?, ?)`,
            [nome, ddd, numeroTelefone, email, senha]
        );

        res.status(201).json({
            mensagem: "Cliente cadastrado com sucesso!"
        });

    } catch (erro) {
        console.error("Erro no cadastro:", erro);

        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao cadastrar cliente."
        });
    }
});

// ==========================================
// LOGIN DO CLIENTE
// ==========================================

app.post("/login", async function (req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe o e-mail e a senha."
            });
        }

        const [resultado] = await db.query(
            `SELECT id_cliente, nome, email, DDD, telefone
             FROM Cliente
             WHERE email = ? AND senha = ?`,
            [email, senha]
        );

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

    } catch (erro) {
        console.error("Erro no login:", erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao fazer login."
        });
    }
});

// ==========================================
// PERFIL DO CLIENTE
// ==========================================

app.get("/perfil/:id_cliente", async function (req, res) {
    try {
        const [resultado] = await db.query(
            `SELECT
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
             LEFT JOIN Veiculo v ON c.id_cliente = v.id_cliente
             WHERE c.id_cliente = ?
             ORDER BY v.id_veiculo DESC
             LIMIT 1`,
            [req.params.id_cliente]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        res.json(resultado[0]);

    } catch (erro) {
        console.error("Erro ao buscar perfil:", erro);

        res.status(500).json({
            mensagem: "Erro ao buscar perfil."
        });
    }
});

// ==========================================
// HISTÓRICO DO CLIENTE
// ==========================================

app.get("/historico/:id_cliente", async function (req, res) {
    try {
        const [resultado] = await db.query(
            `SELECT
                a.id_agendamento,
                a.data_agendamento,
                a.data_horario,
                a.status,
                v.placa,
                v.marca,
                v.modelo,
                s.nome AS servico,
                c.nome AS cliente
             FROM Agendamento a
             INNER JOIN Veiculo v ON a.id_veiculo = v.id_veiculo
             INNER JOIN Servico s ON a.id_servico = s.id_servico
             INNER JOIN Cliente c ON v.id_cliente = c.id_cliente
             WHERE c.id_cliente = ?
             ORDER BY a.data_agendamento DESC, a.data_horario DESC`,
            [req.params.id_cliente]
        );

        res.json(resultado);

    } catch (erro) {
        console.error("Erro ao buscar histórico:", erro);

        res.status(500).json({
            mensagem: "Erro ao buscar histórico."
        });
    }
});

// ==========================================
// AGENDAMENTO FEITO PELO CLIENTE
// ==========================================

app.post("/agendamento", async function (req, res) {
    let conexao;

    try {
        const {
            id_cliente,
            marca,
            modelo,
            motor,
            carroceria,
            placa,
            ano,
            cor,
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

        conexao = await db.getConnection();
        await conexao.beginTransaction();

        const [clientes] = await conexao.query(
            "SELECT id_cliente FROM Cliente WHERE id_cliente = ?",
            [id_cliente]
        );

        if (clientes.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: "Cliente não encontrado. Faça login novamente."
            });
        }

        const [servicosEncontrados] = await conexao.query(
            "SELECT id_servico FROM Servico WHERE nome = ?",
            [nomeServico]
        );

        if (servicosEncontrados.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: "Serviço não encontrado no banco de dados."
            });
        }

        const [veiculo] = await conexao.query(
            `INSERT INTO Veiculo
                (id_cliente, placa, marca, modelo, Ano, Cor,
                 Carroceria, chassi, versao)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            ]
        );

        await conexao.query(
            `INSERT INTO Agendamento
                (id_veiculo, id_servico, data_agendamento,
                 data_horario, status)
             VALUES (?, ?, ?, ?, 'pendente')`,
            [
                veiculo.insertId,
                servicosEncontrados[0].id_servico,
                data,
                horario
            ]
        );

        await conexao.commit();

        res.status(201).json({
            mensagem: "Agendamento realizado com sucesso!"
        });

    } catch (erro) {
        if (conexao) await conexao.rollback();

        console.error("Erro no agendamento do cliente:", erro);

        res.status(500).json({
            mensagem: "Erro ao realizar agendamento."
        });

    } finally {
        if (conexao) conexao.release();
    }
});

// ==========================================
// LOGIN DO ADMINISTRADOR
// ==========================================

app.post("/admin/login", async function (req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Informe o e-mail e a senha."
            });
        }

        const [administradores] = await db.query(
            `SELECT id_administrador, nome, email, senha
             FROM Administrador
             WHERE email = ?
             LIMIT 1`,
            [String(email).trim().toLowerCase()]
        );

        if (administradores.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        const administrador = administradores[0];

        const senhaValida = await bcrypt.compare(
            senha,
            administrador.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        const token = jwt.sign(
            {
                id_administrador: administrador.id_administrador,
                email: administrador.email,
                tipo: "admin"
            },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.json({
            sucesso: true,
            mensagem: "Login administrativo realizado com sucesso!",
            token,
            administrador: {
                id_administrador: administrador.id_administrador,
                nome: administrador.nome,
                email: administrador.email
            }
        });

    } catch (erro) {
        console.error("Erro no login administrativo:", erro);

        return res.status(500).json({
            mensagem: "Erro ao realizar login administrativo."
        });
    }
});

// ==========================================
// PROTEÇÃO DAS ROTAS ADMINISTRATIVAS
// ==========================================

function autenticarAdmin(req, res, next) {
    const cabecalho = req.headers.authorization;

    const token = cabecalho && cabecalho.startsWith("Bearer ")
        ? cabecalho.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({
            mensagem: "Acesso não autorizado. Faça login como administrador."
        });
    }

    try {
        const dados = jwt.verify(token, JWT_SECRET);

        if (dados.tipo !== "admin" || !dados.id_administrador) {
            return res.status(403).json({
                mensagem: "Acesso permitido somente para administradores."
            });
        }

        req.administrador = dados;
        next();

    } catch (erro) {
        return res.status(401).json({
            mensagem: "Sessão inválida ou expirada. Faça login novamente."
        });
    }
}

// As rotas administrativas abaixo exigem autenticação.
app.use("/admin", autenticarAdmin);

// ==========================================
// PAINEL ADMINISTRATIVO
// ==========================================

// BUSCAR TODOS OS AGENDAMENTOS

app.get("/admin/agendamentos", async function (req, res) {
    try {
        const [resultado] = await db.query(
            `SELECT
                a.id_agendamento,
                DATE_FORMAT(a.data_agendamento, '%Y-%m-%d') AS data,
                TIME_FORMAT(a.data_horario, '%H:%i') AS horario,
                a.status,
                c.id_cliente,
                c.nome AS cliente,
                c.email,
                CONCAT('(', c.DDD, ') ', c.telefone) AS telefone,
                v.id_veiculo,
                v.marca,
                v.modelo,
                v.Ano AS ano,
                v.placa,
                s.nome AS servico
             FROM Agendamento a
             INNER JOIN Veiculo v ON a.id_veiculo = v.id_veiculo
             INNER JOIN Cliente c ON v.id_cliente = c.id_cliente
             INNER JOIN Servico s ON a.id_servico = s.id_servico
             ORDER BY a.data_agendamento ASC, a.data_horario ASC`
        );

        res.json(resultado);

    } catch (erro) {
        console.error("Erro ao carregar agenda administrativa:", erro);

        res.status(500).json({
            mensagem: "Erro ao carregar os agendamentos."
        });
    }
});

// ==========================================
// ATUALIZAR STATUS DO AGENDAMENTO
// ==========================================

app.patch("/admin/agendamentos/:id/status", async function (req, res) {
    try {
        const id = req.params.id;
        const { status } = req.body;

        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({
                mensagem: "Status inválido."
            });
        }

        const [resultado] = await db.query(
            `UPDATE Agendamento
             SET status = ?
             WHERE id_agendamento = ?`,
            [status, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Agendamento não encontrado."
            });
        }

        res.json({
            mensagem: "Status atualizado com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar o status."
        });
    }
});

// ==========================================
// NOVO AGENDAMENTO FEITO PELO ADMINISTRADOR
// ==========================================

app.post("/admin/agendamentos", async function (req, res) {
    let conexao;

    try {
        const {
            cliente,
            telefone,
            email,
            marca,
            modelo,
            ano,
            placa,
            servico,
            data,
            horario,
            status
        } = req.body;

        if (
            !cliente || !telefone || !marca || !modelo ||
            !ano || !placa || !servico || !data || !horario
        ) {
            return res.status(400).json({
                mensagem: "Preencha os campos obrigatórios."
            });
        }

        const numeros = String(telefone).replace(/\D/g, "");

        if (numeros.length !== 10 && numeros.length !== 11) {
            return res.status(400).json({
                mensagem: "Informe o telefone com DDD."
            });
        }

        if (status && !statusPermitidos.includes(status)) {
            return res.status(400).json({
                mensagem: "Status inválido."
            });
        }

        const ddd = numeros.substring(0, 2);
        const numeroTelefone = numeros.substring(2);
        const nomeServico = servicos[servico] || servico;
        const statusInicial = status || "pendente";

        conexao = await db.getConnection();
        await conexao.beginTransaction();

        let emailCliente = email ? email.trim().toLowerCase() : "";

        if (!emailCliente) {
            emailCliente = `presencial-${Date.now()}-${crypto.randomBytes(3).toString("hex")}@paulocar.local`;
        }

        const [clientes] = await conexao.query(
            `SELECT id_cliente
             FROM Cliente
             WHERE email = ? OR (DDD = ? AND telefone = ?)
             LIMIT 1`,
            [emailCliente, ddd, numeroTelefone]
        );

        let idCliente;

        if (clientes.length > 0) {
            idCliente = clientes[0].id_cliente;

            await conexao.query(
                `UPDATE Cliente
                 SET nome = ?, DDD = ?, telefone = ?
                 WHERE id_cliente = ?`,
                [cliente.trim(), ddd, numeroTelefone, idCliente]
            );

        } else {
            const senhaInicial = crypto.randomBytes(24).toString("hex");

            const [novoCliente] = await conexao.query(
                `INSERT INTO Cliente
                    (nome, DDD, telefone, email, senha)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    cliente.trim(),
                    ddd,
                    numeroTelefone,
                    emailCliente,
                    senhaInicial
                ]
            );

            idCliente = novoCliente.insertId;
        }

        const [servicosEncontrados] = await conexao.query(
            "SELECT id_servico FROM Servico WHERE nome = ?",
            [nomeServico]
        );

        if (servicosEncontrados.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: "Serviço não encontrado no banco de dados."
            });
        }

        const [novoVeiculo] = await conexao.query(
            `INSERT INTO Veiculo
                (id_cliente, placa, marca, modelo, Ano, Cor,
                 Carroceria, chassi, versao)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idCliente,
                placa.trim().toUpperCase(),
                marca.trim(),
                modelo.trim(),
                ano,
                "Não informado",
                "Não informado",
                "Não informado",
                "Não informado"
            ]
        );

        const [novoAgendamento] = await conexao.query(
            `INSERT INTO Agendamento
                (id_veiculo, id_servico, data_agendamento,
                 data_horario, status)
             VALUES (?, ?, ?, ?, ?)`,
            [
                novoVeiculo.insertId,
                servicosEncontrados[0].id_servico,
                data,
                horario,
                statusInicial
            ]
        );

        await conexao.commit();

        res.status(201).json({
            mensagem: "Agendamento cadastrado com sucesso!",
            id_agendamento: novoAgendamento.insertId,
            id_cliente: idCliente
        });

    } catch (erro) {
        if (conexao) await conexao.rollback();

        console.error("Erro no agendamento administrativo:", erro);

        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Já existe um cadastro com esse e-mail."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao cadastrar o agendamento."
        });

    } finally {
        if (conexao) conexao.release();
    }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORTA, function () {
    console.log("Servidor funcionando na porta " + PORTA);
});
