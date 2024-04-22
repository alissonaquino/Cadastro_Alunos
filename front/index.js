$(document).ready(async function () {
    PreencherTabela();

    const formCadastro = document.getElementById('formCadastro');
    formCadastro.addEventListener('submit', submitForm)

    $(document).on('click', '.btn-excluir', function () {
        const id = $(this).data('id');
        try {
            DeletarAluno(id);
            alert("Aluno deletado com sucesso!")
        } catch {
            alert("Ocorreu um erro ao tentar deletar este aluno!")
        }

        PreencherTabela();
    })
})


$(document).ready(function () {
    // Função para abrir a modal de edição
    $(document).on('click', '.btn-editar', function () {
        const id = $(this).data('id'); // Obtém o ID do aluno selecionado
        $('#formEditar').data('id', id);
        BuscarAluno(id) // Chama a função BuscarAluno para obter os dados do aluno
            .then(aluno => {
                // Preenche os campos da modal com os dados do aluno
                $('#editNome').val(aluno.nome);
                $('#editSobrenome').val(aluno.sobrenome);
                $('#editEmail').val(aluno.email);
                $('#editDataNasc').val(aluno.data_nasc);

                // Abre a modal de edição
                $('#editarModal').modal('show');
            })
            .catch(error => {
                console.error('Erro ao buscar aluno:', error);
                alert('Ocorreu um erro ao buscar os dados do aluno.');
            });
    });

    // Função para lidar com o envio do formulário de edição
    $('#formEditar').submit(function (e) {
        e.preventDefault(); // Evita o comportamento padrão de submissão do formulário

        const id = $(this).data('id'); // Obtém o ID do aluno selecionado
        const data = {
            nome: $('#editNome').val(),
            sobrenome: $('#editSobrenome').val(),
            email: $('#editEmail').val(),
            data_nasc: $('#editDataNasc').val()
        };

        // Chama a função EditarAluno para enviar os dados atualizados para a API
    
        EditarAluno(id, data)
            .then(response => {
                console.log('Aluno editado com sucesso:', response);
                alert('Aluno editado com sucesso.');
                $('#editarModal').modal('hide'); // Fecha a modal após a edição ser concluída
                PreencherTabela(); // Atualiza a tabela de alunos
            })
            .catch(error => {
                console.error('Erro ao editar aluno:', error);
                alert('Ocorreu um erro ao editar o aluno.');
            });
    });
});


async function submitForm(e) {
    e.preventDefault();
    const form = {};

    this.querySelectorAll('input').forEach(el => form[el.name] = el.value);

    console.log(form)
    const response = await CadastrarAluno(form);
    console.log(response)
}

async function PreencherTabela() {
    const alunos = await BuscarAlunos();

    MontarTabela(alunos);
}

async function BuscarAlunos() {
    const response = await fetch('http://localhost:3000/alunos');
    return response.json();
}

async function BuscarAluno(id) {
    const response = await fetch(`http://localhost:3000/alunos/${id}`);
    return response.json();
}

async function DeletarAluno(id) {
    const response = await fetch(`http://localhost:3000/alunos/${id}`, {
        method: 'DELETE'
    });
    return response.json();
}

async function CadastrarAluno(aluno) {
    try {
        const response = await fetch(`http://localhost:3000/alunos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(aluno)
        });

        if (!response.ok) {
            throw new Error('Erro ao cadastrar aluno: ' + response.statusText);
        }

        let data;
        try {
            data = await response.json();
        } catch (error) {
            console.error('Erro ao converter resposta para JSON:', error);
            alert('Aluno cadastrado com sucesso');
            return null;
        }

        alert('Aluno cadastrado com sucesso!')
        return data;
    } catch (error) {
        console.error('Erro ao cadastrar aluno:', error);
        alert('Ocorreu um erro ao cadastrar o aluno.')
        throw error;
    }
}




async function EditarAluno(id, aluno) {
    aluno.data_nasc = new Date(aluno.data_nasc).toISOString().split('T')[0]; // Formata a data para 'yyyy-mm-dd'

    const response = await fetch(`http://localhost:3000/alunos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(aluno)
    });

    if (!response.ok) {
        throw new Error('Erro ao editar aluno: ' + response.statusText);
    }

    try {
        return await response.json(); // Tenta analisar a resposta como JSON
    } catch (error) {
        console.error('Erro ao analisar a resposta JSON:', error);
        return null; // Retorna null ou outra indicação de sucesso
    }
}




function MontarTabela(data) {
    if ($.fn.DataTable.isDataTable('#tabela-cadastro')) {
        $('#tabela-cadastro').DataTable().destroy();
    }

    $('#tabela-cadastro').DataTable({
        data,
        language: {
            emptyTable: "Nenhum registro encontrado",
            info: "Mostrando de _START_ até _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 até 0 de 0 registros",
            infoFiltered: "(Filtrados de _MAX_ registros)",
            infoPostFix: "",
            thousands: ".",
            lengthMenu: "_MENU_ resultados por página",
            loadingRecords: "Carregando...",
            processing: "Processando...",
            zeroRecords: "Nenhum registro encontrado",
            search: "Pesquisar:",
            paginate: {
                next: "Próximo",
                previous: "Anterior",
                first: "Primeiro",
                last: "Último"
            },
            aria: {
                "sortAscending": ": Ordenar colunas de forma ascendente",
                "sortDescending": ": Ordenar colunas de forma descendente"
            }
        },
        columns: [
            { data: 'nome' },
            { data: 'email' },
            {
                data: 'data_nasc',
                render: function (data) {
                    if (data)
                        return new Date(data).toLocaleDateString('pt-BR');
                    else
                        return '';
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `<button class="btn btn-primary btn-editar" data-id="${row.id}"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-danger btn-excluir" data-id="${row.id}"><i class="bi bi-trash"></i></button>`
                }
            }
        ]
    });
}
