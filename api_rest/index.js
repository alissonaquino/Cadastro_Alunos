const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./dbConfig'); 
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/alunos', async (req, res) => {
    try {
        const { nome, sobrenome, email, data_nasc } = req.body;
        const query = `INSERT INTO alunos (nome, sobrenome, email, data_nasc) VALUES (?, ?, ?, ?)`;
        connection.query(query, [nome, sobrenome, email, data_nasc], (error, results) => {
            if (error) {
                console.error('Erro ao cadastrar aluno:', error);
                res.status(500).send('Erro ao cadastrar aluno');
                return;
            }
            res.status(201).send('Aluno cadastrado com sucesso!');
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        res.status(500).send('Erro ao processar requisição');
    }
});

app.get('/alunos/:id', (req, res) => {
    const alunoId = req.params.id;
    connection.query('SELECT * FROM alunos WHERE id = ?', [alunoId], (error, results) => {
        if (error) {
            console.error('Erro ao buscar aluno pelo ID:', error);
            res.status(500).send('Erro interno do servidor');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Aluno não encontrado');
            return;
        }
        res.json(results[0]); 
    });
});

app.get('/alunos', async (req, res) => {
    try {
        connection.query('SELECT * FROM alunos', (error, results) => {
            if (error) {
                console.error('Erro ao buscar alunos:', error);
                res.status(500).send('Erro ao buscar alunos');
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        res.status(500).send('Erro ao processar requisição');
    }
});

app.delete('/alunos/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM alunos WHERE id = ?', [id], (error, results) => {
        if (error) throw error;
        res.send('Aluno excluído com sucesso!');
    });
});

app.put('/alunos/:id', (req, res) => {
    const alunoId = req.params.id;
    const { nome, sobrenome, email, data_nasc } = req.body;
    const query = `UPDATE alunos SET nome = ?, sobrenome = ?, email = ?, data_nasc = ? WHERE id = ?`;
    connection.query(query, [nome, sobrenome, email, data_nasc, alunoId], (error, results) => {
        if (error) {
            console.error('Erro ao atualizar aluno:', error);
            res.status(500).send('Erro interno do servidor');
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).send('Aluno não encontrado');
            return;
        }
        res.status(200).send('Aluno atualizado com sucesso');
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
