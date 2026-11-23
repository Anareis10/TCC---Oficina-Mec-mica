
const mysql = require("mysql2");

const banco = mysql.createPool({
    host: "localhost",
    user: "root",
password: "Oficina0713",
    database: "oficinamecanica",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar conexão com o banco
banco.getConnection(function (erro, conexao) {
    if (erro) {
        console.error("Erro ao conectar com o banco:", erro.message);
        return;
    }

    console.log("Banco de dados conectado com sucesso!");

    conexao.release();
});

module.exports = banco;
