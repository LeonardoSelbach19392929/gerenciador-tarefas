let tarefas = [];

function salvarDados() {
    try {
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        alert("Não foi possível salvar os dados!!")
    }
}

function carregarDados() {
    try {
        const dados = localStorage.getItem('tarefas');
    tarefas = dados ? JSON.parse(dados) : [];
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert("Não foi possível carregar os dados!!");
    }
}

function aplicarTema(modoEscuro) {
    const btn = document.getElementById('btn-tema');
    if (modoEscuro) {
        document.documentElement.classList.add('modo-escuro');
        btn.textContent = '☀️ Modo claro';
    } else {
        document.documentElement.classList.remove('modo-escuro');
        btn.textContent = '🌙 Modo escuro';
    }
}

function alternarTema() {
    const modoAtual = localStorage.getItem('modoEscuro') === '1';
    const novoModo = !modoAtual;
    localStorage.setItem('modoEscuro', novoModo ? '1' : '0');
    aplicarTema(novoModo);
}

function carregarTema() {
    const salvo = localStorage.getItem('modoEscuro');
    const modoEscuro = salvo === null ? true : salvo === '1';
    if (salvo === null) localStorage.setItem('modoEscuro', '1');
    aplicarTema(modoEscuro);
}

function atualizarIndicadores() {
    const total      = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes  = total - concluidas;

    document.getElementById('ind-total').textContent      = total;
    document.getElementById('ind-pendentes').textContent  = pendentes;
    document.getElementById('ind-concluidas').textContent = concluidas;
}

function atualizarFiltroCategoria() {
    const select = document.getElementById('filtro-categoria');
    const valorAtual = select.value;

    const categorias = [...new Set(tarefas.map(t => t.categoria))].sort();

    select.innerHTML = '<option value="todas">Todas</option>';
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });

    if (categorias.includes(valorAtual)) {
        select.value = valorAtual;
    }
}

function tarefasFiltradas() {
    const situacao  = document.getElementById('filtro-situacao').value;
    const categoria = document.getElementById('filtro-categoria').value;

    return tarefas.filter(t => {
        const passaSituacao =
            situacao === 'todas'     ? true :
            situacao === 'pendentes' ? !t.concluida :
                                       t.concluida;

        const passaCategoria = categoria === 'todas' || t.categoria === categoria;

        return passaSituacao && passaCategoria;
    });
}

function formatarData(dataISO) {
    if (!dataISO) return '—';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function textoPrioridade(prioridade) {
    return { baixa: 'Baixa', media: 'Média', alta: 'Alta' }[prioridade] || prioridade;
}

function criarElementoTarefa(tarefa) {
    const item = document.createElement('div');
    item.classList.add('tarefa-item');
    item.dataset.id = tarefa.id;
    item.dataset.prioridade = tarefa.prioridade;
    if (tarefa.concluida) item.classList.add('concluida');

    const classeBadgePrio = `badge badge-${tarefa.prioridade}`;

    const badgeSituacao = tarefa.concluida
        ? '<span class="badge badge-concluida">✔ Concluída</span>'
        : '';

    const btnAcao = tarefa.concluida
        ? `<button class="btn btn-sm btn-desfazer" data-acao="desfazer" data-id="${tarefa.id}">↩ Desfazer</button>`
        : `<button class="btn btn-sm btn-concluir" data-acao="concluir" data-id="${tarefa.id}">✔ Concluir</button>`;

    item.innerHTML = `
        <div class="tarefa-info">
            <div class="tarefa-descricao">${escaparHTML(tarefa.descricao)}</div>
            <div class="tarefa-meta">
                <span class="badge badge-categoria">${escaparHTML(tarefa.categoria)}</span>
                <span class="${classeBadgePrio}">${textoPrioridade(tarefa.prioridade)}</span>
                <span>📅 ${formatarData(tarefa.data)}</span>
                ${badgeSituacao}
            </div>
        </div>
        <div class="tarefa-acoes">
            ${btnAcao}
            <button class="btn btn-sm btn-excluir" data-acao="excluir" data-id="${tarefa.id}">🗑 Excluir</button>
        </div>
    `;

    return item;
}

function renderizarTarefas() {
    const container = document.getElementById('lista-tarefas');
    container.innerHTML = '';

    const lista = tarefasFiltradas();

    if (lista.length === 0) {
        if (tarefas.length === 0) {
            container.innerHTML = `
                <div class="lista-vazia">
                    <div class="icone">📋</div>
                    <strong>Nenhuma tarefa cadastrada.</strong>
                    <p>Adicione uma tarefa para começar!</p>
                </div>`;
        } else {
            container.innerHTML = `
                <div class="lista-vazia">
                    <div class="icone">🔍</div>
                    <strong>Nenhuma tarefa encontrada.</strong>
                    <p>Tente ajustar os filtros.</p>
                </div>`;
        }
        return;
    }

    lista.forEach(tarefa => {
        container.appendChild(criarElementoTarefa(tarefa));
    });
}

function validarFormulario() {
    const descricao  = document.getElementById('input-descricao').value.trim();
    const categoria  = document.getElementById('input-categoria').value;
    const prioridade = document.getElementById('input-prioridade').value;
    const data       = document.getElementById('input-data').value;

    const erros = [];

    if (!descricao)  erros.push('A descrição da tarefa não pode estar vazia.');
    if (!categoria)  erros.push('Selecione uma categoria.');
    if (!prioridade) erros.push('Selecione uma prioridade.');
    if (!data)       erros.push('Informe a data de conclusão.');

    const divErro = document.getElementById('erro-msg');
    if (erros.length > 0) {
        divErro.innerHTML = erros.map(e => `• ${e}`).join('<br>');
        divErro.classList.add('visivel');
        return false;
    }

    divErro.classList.remove('visivel');
    divErro.innerHTML = '';
    return true;
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function adicionarTarefa() {
    if (!validarFormulario()) return;

    const novaTarefa = {
        id:         gerarId(),
        descricao:  document.getElementById('input-descricao').value.trim(),
        categoria:  document.getElementById('input-categoria').value,
        prioridade: document.getElementById('input-prioridade').value,
        data:       document.getElementById('input-data').value,
        concluida:  false
    };

    tarefas.push(novaTarefa);
    salvarDados();
    limparFormulario();
    atualizarFiltroCategoria();
    atualizarIndicadores();
    renderizarTarefas();
}

function alterarEstadoTarefa(id, concluida) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    tarefa.concluida = concluida;
    salvarDados();
    atualizarIndicadores();
    renderizarTarefas();
}

function excluirTarefa(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    const confirmado = confirm(
        `Deseja excluir definitivamente a tarefa:\n"${tarefa.descricao}"?\n\nEsta ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    tarefas = tarefas.filter(t => t.id !== id);
    salvarDados();
    atualizarFiltroCategoria();
    atualizarIndicadores();
    renderizarTarefas();
}

function escaparHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function limparFormulario() {
    document.getElementById('input-descricao').value  = '';
    document.getElementById('input-categoria').value  = '';
    document.getElementById('input-prioridade').value = '';
    document.getElementById('input-data').value       = '';
}

function configurarEventos() {
    document.getElementById('btn-adicionar').addEventListener('click', adicionarTarefa);

    document.getElementById('input-descricao').addEventListener('keydown', e => {
        if (e.key === 'Enter') adicionarTarefa();
    });

    document.getElementById('filtro-situacao').addEventListener('change', renderizarTarefas);
    document.getElementById('filtro-categoria').addEventListener('change', renderizarTarefas);

    document.getElementById('btn-tema').addEventListener('click', alternarTema);

    document.getElementById('lista-tarefas').addEventListener('click', e => {
        const btn = e.target.closest('button[data-acao]');
        if (!btn) return;

        const acao = btn.dataset.acao;
        const id   = btn.dataset.id;

        if (acao === 'concluir') alterarEstadoTarefa(id, true);
        if (acao === 'desfazer') alterarEstadoTarefa(id, false);
        if (acao === 'excluir')  excluirTarefa(id);
    });
}

function iniciar() {
    carregarDados();
    carregarTema();
    atualizarFiltroCategoria();
    atualizarIndicadores();
    renderizarTarefas();
    configurarEventos();
}

document.addEventListener('DOMContentLoaded', iniciar);