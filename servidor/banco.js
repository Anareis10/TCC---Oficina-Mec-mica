const mysql = require("mysql2");

const banco = 
mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Oficina0713",
    database: "oficinamecanica"
});

banco.connect(function(erro) {
    if (erro) {
        console.log("Erro ao conectar com o banco:");
        console.log(erro);
        return;
    }

    console.log("Banco de dados conectado!");
});

module.exports = banco;