const sqlite3 = require('sqlite3').verbose();

// Cria o arquivo do banco de dados
const db = new sqlite3.Database('./sistema.db', (err) => {
    if (err) console.error('Erro BD:', err.message);
    else console.log('Banco de Dados Conectado.');
});

db.serialize(() => {
    // 1. Tabela Usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT, email TEXT, login TEXT, senha TEXT, perfil TEXT
    )`);

    // --- CRIAÇÃO DO ADMIN (Backend apenas) ---
    // Esta parte APENAS insere o dado no banco. Não faz login.
    const sqlAdmin = `INSERT INTO usuarios (nome, email, login, senha, perfil) 
                      SELECT 'Administrador', 'admin@sistema.com', 'admin', '1234', 'Administrador'
                      WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE login = 'admin')`;
    
    db.run(sqlAdmin, (err) => {
        if (!err) console.log("Verificação de Admin concluída (Banco de Dados pronto).");
    });

    // 2. Tabela Clientes
    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT, email TEXT, telefone TEXT, cidade TEXT
    )`);

    // 3. Tabela Fornecedores
    db.run(`CREATE TABLE IF NOT EXISTS fornecedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresa TEXT, contato TEXT, email TEXT, cnpj TEXT
    )`);
});

module.exports = db;