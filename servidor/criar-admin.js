
const bcrypt = require("bcryptjs");
const banco = require("./banco");
const db = banco.promise();

const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

async function criarAdministrador() {
    const rl = readline.createInterface({ input, output });

    try {
        console.log("\n=== CADASTRO DO ADMINISTRADOR ===\n");

        const nome = await rl.question("Nome: ");
        const email = (await rl.question("E-mail: ")).trim().toLowerCase();
        const senha = await rl.question("Senha: ");

        if (!nome.trim() || !email || senha.length < 8) {
            console.log("Preencha todos os campos. A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        const [existente] = await db.execute(
            "SELECT id_administrador FROM Administrador WHERE email = ?",
            [email]
        );

        if (existente.length > 0) {
            console.log("Já existe um administrador com esse e-mail.");
            return;
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await db.execute(
            "INSERT INTO Administrador (nome, email, senha) VALUES (?, ?, ?)",
            [nome.trim(), email, senhaCriptografada]
        );

        console.log("\nAdministrador cadastrado com sucesso!");

    } catch (erro) {
        console.error("Erro ao cadastrar administrador:", erro.message);
    } finally {
        rl.close();
        await db.end();
    }
}

criarAdministrador();
