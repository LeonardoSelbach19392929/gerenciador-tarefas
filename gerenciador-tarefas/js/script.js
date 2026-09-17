/**
 * Gerenciador de Tarefas
 * Curso de Desenvolvimento Front-end – Bolsa Futuro Digital / IFSUL
 *
 * Funcionalidades:
 *  - Cadastro de tarefas (descrição, categoria, prioridade, data)
 *  - Listagem dinâmica no DOM
 *  - Concluir / desfazer conclusão
 *  - Exclusão com confirmação
 *  - Filtros por situação e categoria
 *  - Indicadores (total, pendentes, concluídas)
 *  - Persistência via localStorage
 *  - Modo escuro persistido
 */

// ============================================================
// 1. ESTADO DA APLICAÇÃO
// ============================================================

/** @type {Array<{id:string, descricao:string, categoria:string, prioridade:string, data:string, concluida:boolean}>} */
let tarefas = [];

// ============================================================
// 2. ARMAZENAMENTO (localStorage)
// ============================================================

/**
 * Salva o array de tarefas no localStorage como JSON.
 */
function salvarDados() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

/**
 * Lê as tarefas do localStorage e inicializa o array.
 * Se não houver dados, inicia com array vazio.
 */
function carregarDados() {
    const dados = localStorage.getItem('tarefas');
    tarefas = dados ? JSON.parse(dados) : [];
}

// ============================================================
// 3. TEMA (modo escuro)
// ============================================================

/**
 * Aplica ou remove o modo escuro e atualiza o botão.
 * O estado é salvo no localStorage.
 */
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
    // Padrão: modo escuro ligado (igual ao projeto anterior do aluno)
    const salvo = localStorage.getItem('modoEscuro');
    const modoEscuro = salvo === null ? true : salvo === '1';
    if (salvo === null) localStorage.setItem('modoEscuro', '1');
    aplicarTema(modoEscuro);
}

// ============================================================
// 4. INDICADORES
// ============================================================

/**
 * Atualiza os contadores de total, pendentes e concluídas
 * com base no array atual de tarefas (sem filtro).
 */
function atualizarIndicadores() {
    const total     = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes  = total - concluidas;

    document.getElementById('ind-total').textContent     = total;
    document.getElementById('ind-pendentes').textContent  = pendentes;
    document.getElementById('ind-concluidas').textContent = concluidas;
}

// ============================================================
// 5. FILTROS DE CATEGORIA
// ============================================================

/**
 * Reconstrói as opções do <select> de categoria
 * com base nas categorias presentes nas tarefas salvas.
 */
function atualizarFiltroCategoria() {
    const select = document.getElementById('filtro-categoria');
    const valorAtual = select.value;

    // Obtém categorias únicas
    const categorias = [...new Set(tarefas.map(t => t.categoria))].sort();

    // Limpa e reconstrói
    select.innerHTML = '<option value="todas">Todas</option>';
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });

    // Tenta manter o filtro anterior
    if (categorias.includes(valorAtual)) {
        select.value = valorAtual;
    }
}

/**
 * Retorna as tarefas filtradas conforme os selects de situação e categoria.
 * Os filtros NÃO alteram os dados originais.
 */
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

// ============================================================
// 6. RENDERIZAÇÃO DA LISTA
// ============================================================

/**
 * Formata uma data 'YYYY-MM-DD' para 'DD/MM/AAAA'.
 * @param {string} dataISO
 * @returns {string}
 */
function formatarData(dataISO) {
    if (!dataISO) return '—';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

/**
 * Retorna o texto legível de uma prioridade.
 * @param {string} prioridade
 * @returns {string}
 */
function textoPrioridade(prioridade) {
    return { baixa: 'Baixa', media: 'Média', alta: 'Alta' }[prioridade] || prioridade;
}

/**
 * Cria e retorna o elemento DOM de uma tarefa.
 * @param {{id:string, descricao:string, categoria:string, prioridade:string, data:string, concluida:boolean}} tarefa
 * @returns {HTMLElement}
 */
function criarElementoTarefa(tarefa) {
    const item = document.createElement('div');
    item.classList.add('tarefa-item');
    item.dataset.id = tarefa.id;
    item.dataset.prioridade = tarefa.prioridade;
    if (tarefa.concluida) item.classList.add('concluida');

    // Badge de prioridade
    const classeBadgePrio = `badge badge-${tarefa.prioridade}`;

    // Badge de situação (só aparece se concluída)
    const badgeSituacao = tarefa.concluida
        ? '<span class="badge badge-concluida">✔ Concluída</span>'
        : '';

    // Botão de concluir ou desfazer
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

/**
 * Renderiza a lista de tarefas filtradas no DOM.
 * Exibe mensagem se não houver tarefas.
 */
function renderizarTarefas() {
    const container = document.getElementById('lista-tarefas');
    container.innerHTML = '';

    const lista = tarefasFiltradas();

    if (lista.length === 0) {
        // Mensagem diferente dependendo se há tarefas cadastradas ou só filtradas
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

// ============================================================
// 7. VALIDAÇÃO DO FORMULÁRIO
// ============================================================

/**
 * Valida os campos do formulário.
 * Exibe mensagem de erro e retorna false se inválido.
 * @returns {boolean}
 */
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

// ============================================================
// 8. OPERAÇÕES DE TAREFA
// ============================================================

/**
 * Gera um ID único simples baseado em timestamp + random.
 * @returns {string}
 */
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Lê os dados do formulário, valida e adiciona a nova tarefa.
 * A tarefa inicia sempre como pendente.
 */
function adicionarTarefa() {
    if (!validarFormulario()) return;

    const novaTarefa = {
        id:         gerarId(),
        descricao:  document.getElementById('input-descricao').value.trim(),
        categoria:  document.getElementById('input-categoria').value,
        prioridade: document.getElementById('input-prioridade').value,
        data:       document.getElementById('input-data').value,
        concluida:  false   // nova tarefa sempre começa como pendente
    };

    tarefas.push(novaTarefa);
    salvarDados();
    limparFormulario();
    atualizarFiltroCategoria();
    atualizarIndicadores();
    renderizarTarefas();
}

/**
 * Altera o estado de conclusão de uma tarefa e persiste.
 * @param {string} id
 * @param {boolean} concluida
 */
function alterarEstadoTarefa(id, concluida) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    tarefa.concluida = concluida;
    salvarDados();
    atualizarIndicadores();
    renderizarTarefas();
}

/**
 * Remove uma tarefa do array após confirmação do usuário.
 * @param {string} id
 */
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

// ============================================================
// 9. UTILITÁRIOS
// ============================================================

/**
 * Escapa caracteres HTML para evitar XSS ao inserir texto no DOM.
 * @param {string} str
 * @returns {string}
 */
function escaparHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Limpa os campos do formulário após cadastro bem-sucedido.
 */
function limparFormulario() {
    document.getElementById('input-descricao').value  = '';
    document.getElementById('input-categoria').value  = '';
    document.getElementById('input-prioridade').value = '';
    document.getElementById('input-data').value       = '';
}

// ============================================================
// 10. EVENTOS
// ============================================================

/**
 * Configura todos os event listeners da aplicação.
 */
function configurarEventos() {
    // Botão de adicionar tarefa
    document.getElementById('btn-adicionar').addEventListener('click', adicionarTarefa);

    // Permite pressionar Enter no campo de descrição para adicionar
    document.getElementById('input-descricao').addEventListener('keydown', e => {
        if (e.key === 'Enter') adicionarTarefa();
    });

    // Filtros – atualizam a lista dinamicamente sem alterar os dados
    document.getElementById('filtro-situacao').addEventListener('change', renderizarTarefas);
    document.getElementById('filtro-categoria').addEventListener('change', renderizarTarefas);

    // Botão de alternar tema
    document.getElementById('btn-tema').addEventListener('click', alternarTema);

    // Delegação de eventos para concluir / desfazer / excluir tarefas
    // Usa delegação para não precisar re-adicionar listeners a cada renderização
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

// ============================================================
// 11. INICIALIZAÇÃO
// ============================================================

/**
 * Ponto de entrada: carrega dados, aplica tema e renderiza a interface.
 */
function iniciar() {
    carregarDados();
    carregarTema();
    atualizarFiltroCategoria();
    atualizarIndicadores();
    renderizarTarefas();
    configurarEventos();
}

document.addEventListener('DOMContentLoaded', iniciar);
