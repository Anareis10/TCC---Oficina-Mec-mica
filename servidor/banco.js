
const mysql = require("mysql2");

const banco = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Oficina0713",
    database: "oficinamecanica"
});

banco.connect(function (erro) {
    if (erro) {
        console.error("Erro ao conectar com o banco de dados:", erro.message);
        return;
    }

    console.log("Banco de dados conectado com sucesso!");
});

module.exports = banco;
