// Nesse arquivo estão funções que são usadas em mais de uma tela
// Os ajax desse js, chamam o arquivo ajax.php, que se comunica com o Methods.php, que por sequência realiza as interações com o banco de dados

$(document).ready(function () {
    $(document).on('click', '.update-task', function () {
        if ($(this).is('td')) updateTask({ id: $(this).closest('tr').attr('id'), from: $(this).closest('tr').attr('from') });
        else updateTask({ id: $(this).closest('li').attr('id'), from: $(this).closest('li').attr('from') });
    });

    $(document).on('click', '.delete-task', function () {
        if ($(this).is('td')) deleteTask({ id: $(this).closest('tr').attr('id'), from: $(this).closest('tr').attr('from') });
        else deleteTask({ id: $(this).closest('li').attr('id'), from: $(this).closest('li').attr('from') });
    });

    $(document).on('input', 'input.validate, textarea.validate', function () {
        validation();
    });
})

// Função para criar tasks
async function createTask({ from }) {
    await Swal.fire({
        title: `New task`,
        html: ` <div class="update-task-div">
                    <label class="custom-label" for="task_title">Title</label>
                    <input maxlength="255" class="custom-input validate" id="task_title">
                    <label class="custom-label" for="task_description">Description</label>
                    <textarea maxlength="65535" class="custom-textarea validate" id="task_description" rows="10"></textarea>
                    <label class="custom-label" for="task_status">Status</label>
                    <select class="custom-select" id="task_status">
                    </select>
                </div>`,
        focusConfirm: false,
        showDenyButton: true,
        confirmButtonText: 'Create',
        denyButtonText: 'Cancel',
        willOpen: () => {
            validation(true);
            returnStatusOptions();
        },
        customClass: {
            title: 'custom-title',
            actions: 'custom-actions',
            htmlContainer: 'custom-htmlContainer'
        },
        preConfirm: () => {
            $.ajax({
                type: 'POST',
                url: './ajax/ajax.php',
                data: {
                    'method': 'createTask',
                    'data': {
                        'title': $('#task_title').val(),
                        'description': $('#task_description').val(),
                        'status_id': $('#task_status').val()
                    }
                },
                success: function (result) {
                    result = JSON.parse(result);
                    if (result.status !== 200) error({ code: result.status, message: result.message });
                    else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Task created with success!',
                            showConfirmButton: false,
                            position: 'bottom-end',
                            timer: 2000,
                        }).then(() => {
                            // if (from == 'table') location.reload();
                            if (from == 'table') updateTable();
                            else updateKanban();
                        });
                    }
                }
            });
        }
    });
}

// Função para retornar os dados das tasks quando o modal de edição é aberto
function readTask({ id, from }) {
    $.ajax({
        type: 'POST',
        url: './ajax/ajax.php',
        data: {
            'method': 'readTask',
            'data': {
                'from': from,
                'ajax': true,
                'id': id
            }
        },
        success: function (result) {
            result = JSON.parse(result);
            if (result.status !== 200) error({ code: result.status, message: result.message });
            else {
                $('#task_title').val($('<div/>').html(result.data.title).text());
                $('#task_description').val($('<div/>').html(result.data.description).text());
                $('#created').text('Created: ' + result.data.created);
                if (result.data.concluded) $('#created').after('<span class="mt-1">Concluded: ' + result.data.concluded + '</span>');
                returnStatusOptions(result.data.status_id);
            }
        }
    });
}

// Função para atualizar uma task
async function updateTask({ id, from }) {
    await Swal.fire({
        title: `Edit task ${id.split("_").pop()}`,
        html: ` <div class="update-task-div">
                    <label class="custom-label" for="task_title">Title</label>
                    <input maxlength="255" class="custom-input validate" id="task_title">
                    <label class="custom-label" for="task_description">Description</label>
                    <textarea maxlength="65535" class="custom-textarea validate" id="task_description" rows="10"></textarea>
                    <label class="custom-label" for="task_status">Status</label>
                    <select class="custom-select" id="task_status">
                    </select>
                    <div class="date-div">
                        <span id="created"></span>
                    </div>
                </div>`,
        focusConfirm: false,
        showDenyButton: true,
        denyButtonText: 'Cancel',
        confirmButtonText: 'Save',
        customClass: {
            title: 'custom-title',
            actions: 'custom-actions',
            htmlContainer: 'custom-htmlContainer'
        },
        willOpen: () => {
            readTask({ id: id.split("_").pop(), from: from });
        },
        preConfirm: () => {
            $.ajax({
                type: 'POST',
                url: './ajax/ajax.php',
                data: {
                    'method': 'updateTask',
                    'data': {
                        'title': $('#task_title').val(),
                        'description': $('#task_description').val(),
                        'status_id': $('#task_status').val(),
                        'id': id.split("_").pop()
                    }
                },
                success: function (result) {
                    result = JSON.parse(result);
                    if (result.status !== 200) error({ code: result.status, message: result.message });
                    else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Task updated with success!',
                            showConfirmButton: false,
                            position: 'bottom-end',
                            timer: 2000,
                        }).then(() => {
                            // if (from == 'table') location.reload();
                            if (from == 'table') updateTable();
                            else updateKanban();
                        });
                    }
                }
            });
        }
    })
}

// Função para deletar uma task
function deleteTask({ id, from }) {
    Swal.fire({
        icon: 'warning',
        title: `Are you shure you want to delete task ${id.split("_").pop()}?`,
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'Cancel',
        position: 'bottom-end'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: 'POST',
                url: './ajax/ajax.php',
                data: {
                    'method': 'deleteTask',
                    'data': {
                        'id': id.split("_").pop(),
                        'from': from
                    }
                },
                success: function (result) {
                    result = JSON.parse(result);
                    if (result.status !== 200) error({ code: result.status, message: result.message });
                    else {
                        // if (from == 'table') location.reload();
                        if (from == 'table') updateTable();
                        else updateKanban();
                    }
                }
            });
        }
    });
}

// Função para padronizar o modal de erro
function error({ code, message }) {
    Swal.fire({
        icon: 'error',
        title: 'Error processing your solicitation, try again later',
        text: `Error ${code} - ${message}`,
        confirmButtonText: 'Ok',
        position: 'bottom-end'
    });
}

// Função para validar se os inputs estão preenchidos
function validation(button = false) {
    if (button) {
        $('.validate').each(function () {
            if (!$(this).val()) $('.swal2-confirm').attr('disabled', 'disabled')
            else $('.swal2-confirm').removeAttr('disabled')
        });
    } else {
        $('.validate').each(function () {
            if (!$(this).val()) {
                if ($(this).hasClass('validate')) $(this).addClass('incorrect');
            } else {
                if ($(this).hasClass('validate')) $(this).removeClass('incorrect');
            }
        });

        if ($('.incorrect').length == 0) $('.swal2-confirm').removeAttr('disabled');
        else $('.swal2-confirm').attr('disabled', 'disabled');
    }
}

// Função que insere as options de status no select
function returnStatusOptions(status_id = null) {
    $.ajax({
        type: 'POST',
        url: './ajax/ajax.php',
        data: {
            'method': 'returnStatusOptions',
            'data': {
                'status_id': status_id
            }
        },
        success: function (result) {
            result = JSON.parse(result);
            $('#task_status').append(result.data);
        }
    });
}