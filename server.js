const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTA LOGIN ---
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    // Verifica email OU login
    const sql = "SELECT * FROM usuarios WHERE (email = ? OR login = ?) AND senha = ?";
    db.get(sql, [email, email, senha], (err, row) => {
        if (row) {
            res.json({ usuario: row });
        } else {
            res.status(401).json({ erro: "Dados incorretos" });
        }
    });
});

// --- ROTA DE CADASTRO PÚBLICO ---
app.post('/api/cadastro', (req, res) => {
    const { nome, email, login, senha } = req.body;
    const perfil = 'Usuário'; 
    
    const sql = "INSERT INTO usuarios (nome, email, login, senha, perfil) VALUES (?,?,?,?,?)";
    db.run(sql, [nome, email, login, senha, perfil], function(err) {
        if (err) {
            res.status(500).json({ error: "Erro ao cadastrar." });
        } else {
            res.json({ msg: "Cadastrado com sucesso!" });
        }
    });
});

// --- FUNÇÃO PARA CRIAR ROTAS (CRUD) ---
function criarRotas(tabela) {
    // Listar
    app.get(`/api/${tabela}`, (req, res) => {
        db.all(`SELECT * FROM ${tabela}`, [], (err, rows) => res.json(rows));
    });
    
    // Excluir (Com proteção para o Admin)
    app.delete(`/api/${tabela}/:id`, (req, res) => {
        const id = req.params.id;

        if (tabela === 'usuarios') {
            db.get("SELECT login FROM usuarios WHERE id = ?", [id], (err, row) => {
                if (row && row.login === 'admin') {
                    return res.status(403).json({ erro: "Não é permitido excluir o Administrador Principal." });
                }
                db.run(`DELETE FROM ${tabela} WHERE id = ?`, id, (err) => res.json({msg: 'Deletado'}));
            });
        } else {
            db.run(`DELETE FROM ${tabela} WHERE id = ?`, id, (err) => res.json({msg: 'Deletado'}));
        }
    });
}

criarRotas('usuarios');
criarRotas('clientes');
criarRotas('fornecedores');

// --- ROTAS DE INCLUIR/EDITAR ---
app.post('/api/usuarios', (req, res) => {
    const { nome, email, login, senha, perfil } = req.body;
    db.run("INSERT INTO usuarios (nome, email, login, senha, perfil) VALUES (?,?,?,?,?)", [nome, email, login, senha, perfil], (err) => res.json({msg: 'Ok'}));
});
app.put('/api/usuarios/:id', (req, res) => {
    const { nome, email, login, senha, perfil } = req.body;
    db.run("UPDATE usuarios SET nome=?, email=?, login=?, senha=?, perfil=? WHERE id=?", [nome, email, login, senha, perfil, req.params.id], (err) => res.json({msg: 'Ok'}));
});

// Clientes
app.post('/api/clientes', (req, res) => {
    const { nome, email, telefone, cidade } = req.body;
    db.run("INSERT INTO clientes (nome, email, telefone, cidade) VALUES (?,?,?,?)", [nome, email, telefone, cidade], (err) => res.json({msg: 'Ok'}));
});
app.put('/api/clientes/:id', (req, res) => {
    const { nome, email, telefone, cidade } = req.body;
    db.run("UPDATE clientes SET nome=?, email=?, telefone=?, cidade=? WHERE id=?", [nome, email, telefone, cidade, req.params.id], (err) => res.json({msg: 'Ok'}));
});

// Fornecedores
app.post('/api/fornecedores', (req, res) => {
    const { empresa, contato, email, cnpj } = req.body;
    db.run("INSERT INTO fornecedores (empresa, contato, email, cnpj) VALUES (?,?,?,?)", [empresa, contato, email, cnpj], (err) => res.json({msg: 'Ok'}));
});
app.put('/api/fornecedores/:id', (req, res) => {
    const { empresa, contato, email, cnpj } = req.body;
    db.run("UPDATE fornecedores SET empresa=?, contato=?, email=?, cnpj=? WHERE id=?", [empresa, contato, email, cnpj, req.params.id], (err) => res.json({msg: 'Ok'}));
});

// INICIA O SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor rodando! Clique aqui: http://localhost:${PORT}`);
});