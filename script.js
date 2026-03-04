// ============================================================
//  SCRIPT.JS — Portfolio Interativo
//  Sessões 2, 3 e 4: Dark Mode · Relógio · Visitas · Galeria · Formulário
//
//  CONCEITO FUNDAMENTAL — O QUE É O DOMContentLoaded?
//  ─────────────────────────────────────────────────
//  O browser lê o HTML de cima para baixo. O ficheiro script.js
//  está no final do <body>, mas mesmo assim é boa prática garantir
//  que o HTML está 100% disponível antes de executar código JS.
//
//  document.addEventListener('DOMContentLoaded', função) regista
//  uma função para ser executada quando o browser termina de ler
//  e construir toda a estrutura HTML (o DOM — Document Object Model).
//
//  ⚠️  ATENÇÃO — UM ÚNICO BLOCO DOMContentLoaded:
//  ─────────────────────────────────────────────
//  Versões anteriores deste ficheiro tinham 3 blocos DOMContentLoaded
//  separados (um por sessão). O browser executaria todos e funcionaria,
//  MAS é má prática porque:
//    1. Fica difícil perceber o que corre no arranque da página.
//    2. A ordem de execução não é garantida entre blocos.
//    3. É mais difícil de manter e depurar.
//  Por isso, existe apenas UM bloco DOMContentLoaded (no final do
//  ficheiro) que inicializa tudo de uma vez.
// ============================================================


// ============================================================
//  ATIVIDADE 1: DARK / LIGHT MODE TOGGLE
// ============================================================

/**
 * toggleTheme()
 * Alterna entre o tema claro (light) e o tema escuro (dark).
 *
 * CONCEITO — classList:
 *   Cada elemento HTML pode ter uma ou mais classes CSS.
 *   document.body.classList dá acesso à lista de classes do <body>.
 *     .toggle('dark-mode') → adiciona a classe se não existir, remove se existir.
 *     .contains('dark-mode') → devolve true se a classe estiver presente.
 *     .add('dark-mode') → adiciona a classe.
 *     .remove('dark-mode') → remove a classe.
 *
 * CONCEITO — localStorage:
 *   É um "mini-armazém" do browser onde podemos guardar pares chave/valor
 *   como texto. Os dados persistem mesmo depois de fechar o browser.
 *     localStorage.setItem('chave', 'valor') → guarda
 *     localStorage.getItem('chave') → lê (devolve null se não existir)
 *     localStorage.removeItem('chave') → apaga
 *
 * CONCEITO — Operador ternário (condição ? a : b):
 *   Forma compacta de escrever if/else numa linha.
 *   isDark ? 'dark' : 'light'  →  se isDark for true → 'dark', senão → 'light'
 */
function toggleTheme() {
    // Adiciona ou remove a classe "dark-mode" no elemento <body>.
    // O CSS usa esta classe para mudar as cores de toda a página.
    document.body.classList.toggle('dark-mode');

    // Verifica se a classe "dark-mode" está agora presente (true ou false)
    const isDark = document.body.classList.contains('dark-mode');

    // Guarda a preferência do utilizador para a próxima visita
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    console.log(`Tema alterado para: ${isDark ? 'escuro 🌙' : 'claro ☀️'}`);
}

/**
 * loadSavedTheme()
 * Aplica o tema guardado quando a página carrega.
 *
 * Ordem de prioridade:
 *   1. Se houver preferência guardada no localStorage → usa-a.
 *   2. Se não houver → deteta a preferência do sistema operativo.
 *
 * CONCEITO — window.matchMedia():
 *   Permite perguntar ao browser se uma condição CSS se verifica.
 *   '(prefers-color-scheme: dark)' é uma media query CSS que verifica
 *   se o utilizador tem o modo escuro ativado no sistema (Windows/macOS/etc.).
 *   .matches devolve true ou false.
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme'); // Lê a preferência guardada

    if (savedTheme) {
        // Existe preferência guardada → respeita-a
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
        // Se for 'light', não fazemos nada (o tema claro é o padrão do CSS)
    } else {
        // Sem preferência guardada → tenta detetar o tema do sistema operativo
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
        }
    }

    console.log(`Tema carregado: ${localStorage.getItem('theme') || 'automático (sistema)'}`);
}


// ============================================================
//  ATIVIDADE 2: RELÓGIO DIGITAL
// ============================================================

// Variáveis declaradas fora das funções para serem partilhadas entre elas.
// "let" significa que o valor pode ser alterado posteriormente.
let is24Hour = true;   // true = formato 24h | false = formato 12h (AM/PM)
let clockInterval;     // Vai guardar o ID do setInterval para o podermos parar

/**
 * updateClock()
 * Calcula a hora atual e atualiza os números no HTML.
 *
 * CONCEITO — new Date():
 *   Cria um objeto com a data e hora atuais do sistema.
 *   Métodos úteis:
 *     .getHours()   → horas (0 a 23)
 *     .getMinutes() → minutos (0 a 59)
 *     .getSeconds() → segundos (0 a 59)
 *     .toLocaleDateString('pt-PT', opções) → data formatada em texto
 *
 * CONCEITO — String.padStart(comprimento, caractere):
 *   Garante que a string tem pelo menos N caracteres,
 *   preenchendo com o caractere indicado à esquerda se necessário.
 *   Exemplo: String(7).padStart(2, '0') → '07'
 *   Sem isso, 7:5:3 ficaria assim em vez de 07:05:03.
 *
 * CONCEITO — document.getElementById('id'):
 *   Procura no HTML o elemento com esse id e devolve-o.
 *   Se não encontrar, devolve null.
 *   Por isso usamos sempre "if (elemento)" antes de o usar.
 *
 * CONCEITO — .textContent:
 *   Propriedade que representa o texto visível dentro de um elemento HTML.
 *   elemento.textContent = 'novo texto' → substitui o texto atual.
 */
function updateClock() {
    const now = new Date(); // Objeto com a data e hora atuais

    let hours   = now.getHours();   // 0–23
    let minutes = now.getMinutes(); // 0–59
    let seconds = now.getSeconds(); // 0–59

    // Converter para formato 12h se necessário
    if (!is24Hour) {
        // O operador % (módulo) devolve o resto da divisão.
        // 13 % 12 = 1, 0 % 12 = 0. O "|| 12" trata o caso especial
        // das 0h (meia-noite) e das 12h (meio-dia): 0 % 12 = 0, então || 12 → 12
        hours = hours % 12 || 12;
    }

    // Garantir sempre 2 dígitos (ex: 7 → '07')
    hours   = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    // Procurar os elementos HTML onde os números aparecem
    const hoursEl   = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // Atualizar o texto de cada elemento (o "if" protege contra null)
    if (hoursEl)   hoursEl.textContent   = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;

    // Atualizar a data por extenso (ex: "quinta-feira, 26 de fevereiro de 2026")
    const dateEl = document.getElementById('date');
    if (dateEl) {
        // toLocaleDateString formata a data de acordo com o idioma e opções
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('pt-PT', options);
    }
}

/**
 * startClock()
 * Inicia o relógio e faz com que atualize a cada segundo.
 *
 * CONCEITO — setInterval(função, milissegundos):
 *   Executa a função repetidamente com o intervalo indicado.
 *   1000 ms = 1 segundo.
 *   Devolve um ID numérico que podemos usar para parar o intervalo
 *   com clearInterval(id) se necessário.
 *
 *   Chamamos updateClock() uma vez antes do setInterval para que
 *   o relógio apareça imediatamente sem esperar 1 segundo.
 */
function startClock() {
    updateClock(); // Mostrar imediatamente sem esperar 1 segundo
    clockInterval = setInterval(updateClock, 1000); // Repetir a cada 1000ms
    console.log('⏰ Relógio iniciado!');
}

/**
 * toggleFormat()
 * Alterna entre formato 24h e 12h.
 *
 * CONCEITO — Operador ! (NOT lógico):
 *   Inverte um valor booleano:
 *     !true  → false
 *     !false → true
 *   Assim, is24Hour troca entre true e false a cada clique.
 */
function toggleFormat() {
    is24Hour = !is24Hour; // Inverte: 24h→12h ou 12h→24h
    localStorage.setItem('clockFormat', is24Hour ? '24' : '12');
    updateClock(); // Atualiza imediatamente com o novo formato
    console.log(`Formato do relógio: ${is24Hour ? '24h' : '12h'}`);
}

/**
 * loadClockFormat()
 * Carrega o formato de hora guardado pelo utilizador.
 *
 * (saved === '24') compara a string guardada com '24' e devolve
 * true ou false — que é exatamente o tipo que is24Hour espera.
 */
function loadClockFormat() {
    const saved = localStorage.getItem('clockFormat');
    if (saved) {
        is24Hour = (saved === '24'); // true se '24', false se '12'
    }
    // Se não existir nada guardado, mantém o valor padrão: is24Hour = true (24h)
}


// ============================================================
//  ATIVIDADE 3: CONTADOR DE VISITAS
// ============================================================

/**
 * getVisitCount()
 * Lê o número de visitas guardado no localStorage.
 *
 * CONCEITO — parseInt():
 *   O localStorage guarda tudo como texto (string).
 *   parseInt('5') converte a string '5' para o número inteiro 5.
 *   Sem isto, '5' + 1 = '51' (concatenação) em vez de 6 (soma).
 *
 * CONCEITO — Operador ternário:
 *   count ? parseInt(count) : 0
 *   Se count não for null/undefined/''  →  parseInt(count)
 *   Caso contrário (primeira vez)       →  0
 */
function getVisitCount() {
    const count = localStorage.getItem('visitCount');
    return count ? parseInt(count) : 0;
}

/**
 * incrementVisitCount()
 * Incrementa o contador e guarda a data/hora da visita atual.
 *
 * CONCEITO — new Date().toISOString():
 *   Gera uma string de data no formato universal ISO 8601:
 *   "2026-02-26T10:30:00.000Z"
 *   Este formato é fácil de guardar como texto e depois comparar.
 *
 * count++ é o mesmo que count = count + 1.
 */
function incrementVisitCount() {
    let count = getVisitCount(); // Lê o valor atual
    count++;                     // Adiciona 1
    localStorage.setItem('visitCount', count);                  // Guarda o novo total
    localStorage.setItem('lastVisit', new Date().toISOString()); // Guarda data/hora
    return count;
}

/**
 * formatLastVisit()
 * Converte a data guardada numa frase amigável como "Há 2 horas".
 *
 * CONCEITO — Aritmética com datas:
 *   now - lastVisit → diferença em milissegundos (ms)
 *   Para converter:
 *     ms ÷ 1000 = segundos
 *     ms ÷ 1000 ÷ 60 = minutos
 *     ms ÷ 1000 ÷ 60 ÷ 60 = horas
 *     ms ÷ 1000 ÷ 60 ÷ 60 ÷ 24 = dias
 *
 * CONCEITO — Math.floor():
 *   Arredonda sempre para baixo (trunca os decimais).
 *   Math.floor(2.9) → 2    Math.floor(59.99) → 59
 *
 * CONCEITO — Plural automático com ternário:
 *   `${minutes} minuto${minutes > 1 ? 's' : ''}`
 *   Se minutes for 1 → "1 minuto"
 *   Se minutes for 3 → "3 minutos"
 */
function formatLastVisit() {
    const lastVisitISO = localStorage.getItem('lastVisit');

    // Se não há data guardada, é a primeira visita
    if (!lastVisitISO) return 'Primeira vez aqui! 🎉';

    const lastVisit = new Date(lastVisitISO); // Converte string ISO → objeto Date
    const now       = new Date();
    const diff      = now - lastVisit; // Diferença em milissegundos

    const minutes = Math.floor(diff / 1000 / 60);  // ms → minutos
    const hours   = Math.floor(minutes / 60);        // minutos → horas
    const days    = Math.floor(hours / 24);          // horas → dias

    if (minutes < 1)  return 'Há menos de 1 minuto';
    if (minutes < 60) return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24)   return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
    return `Há ${days} dia${days > 1 ? 's' : ''}`;
}

/**
 * updateVisitDisplay()
 * Atualiza o número de visitas visível na página.
 */
function updateVisitDisplay() {
    const countEl = document.getElementById('visit-count');
    if (countEl) countEl.textContent = getVisitCount();
}

/**
 * updateLastVisitDisplay()
 * Atualiza o texto "Última visita: ..." na página.
 */
function updateLastVisitDisplay() {
    const lastVisitEl = document.getElementById('last-visit');
    if (lastVisitEl) lastVisitEl.textContent = formatLastVisit();
}

/**
 * resetVisitCounter()
 * Apaga os dados do contador e atualiza o ecrã.
 *
 * CONCEITO — window.confirm():
 *   Abre uma caixa de diálogo nativa do browser com "OK" e "Cancelar".
 *   Devolve true se o utilizador clicar OK, false se cancelar.
 *   "if (!confirmed) return;" → sai da função sem fazer nada se cancelar.
 *
 * CONCEITO — localStorage.removeItem():
 *   Apaga completamente a chave e o seu valor do localStorage.
 */
function resetVisitCounter() {
    const confirmed = window.confirm('Tens a certeza que queres resetar o contador?');
    if (!confirmed) return; // Se cancelar, sai sem fazer nada

    localStorage.removeItem('visitCount'); // Apaga o total de visitas
    localStorage.removeItem('lastVisit');  // Apaga a data da última visita

    // Atualiza o ecrã (vai mostrar 0 e "Primeira vez!")
    updateVisitDisplay();
    updateLastVisitDisplay();

    console.log('🔄 Contador resetado!');
    alert('Contador resetado com sucesso!');
}

/**
 * initVisitCounter()
 * Inicializa o contador de visitas no arranque da página.
 *
 * A ORDEM AQUI É MUITO IMPORTANTE:
 *   1. Primeiro mostramos a "última visita" (antes desta visita)
 *   2. Depois incrementamos (regista esta visita)
 *   3. Por fim atualizamos o total visível
 *
 *   Se invertêssemos os passos 1 e 2, o texto "última visita"
 *   mostraria "há menos de 1 minuto" logo na primeira vez que
 *   o utilizador vê a página, o que seria confuso.
 */
function initVisitCounter() {
    updateLastVisitDisplay(); // Passo 1: mostrar quando foi a visita ANTERIOR
    incrementVisitCount();    // Passo 2: registar ESTA visita
    updateVisitDisplay();     // Passo 3: mostrar o novo total
    console.log(`📊 Visita registada! Total: ${getVisitCount()}`);
}


// ============================================================
//  FOOTER — ANO AUTOMÁTICO
// ============================================================

/**
 * setFooterYear()
 * Insere o ano atual no rodapé para que o copyright fique sempre atualizado.
 *
 * new Date().getFullYear() devolve o ano atual como número (ex: 2026).
 * Assim não precisamos de editar o HTML todos os anos.
 */
function setFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}


// ============================================================
//  SESSÃO 3: GALERIA DINÂMICA DE PROJETOS
//  Array de projetos + Filtros + Modal + Pesquisa
// ============================================================


// ============================================================
//  DADOS — Array de Projetos
// ============================================================

/**
 * projects — array (lista ordenada) de objetos.
 *
 * CONCEITO — Array:
 *   Coleção de itens numa ordem definida: [item1, item2, item3, ...]
 *   Acesso por índice (começa em 0): projects[0] → primeiro projeto
 *   .length → número de itens
 *   .forEach() → executa uma função para cada item
 *   .filter() → devolve novo array só com itens que passam numa condição
 *   .find()   → devolve o primeiro item que satisfaz uma condição
 *   .map()    → devolve novo array transformando cada item
 *
 * CONCEITO — Objeto:
 *   Conjunto de pares chave: valor entre chavetas { }
 *   Acesso às propriedades: projeto.title ou projeto['title']
 *
 * CONCEITO — const vs let:
 *   const → o "apontador" da variável não pode mudar (não dá para fazer
 *           projects = outraCOisa), mas o conteúdo do array pode mudar.
 *   let   → o valor pode ser completamente substituído.
 */
const projects = [
    {
        id: 1,
        title: 'E-commerce Website',
        category: 'web',
        description: 'Loja online completa com carrinho de compras',
        image: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=E-commerce',
        tags: ['HTML', 'CSS', 'JavaScript', 'API'],
        link: '#',
        longDescription: 'Website de e-commerce completo com sistema de carrinho, checkout e integração com API de pagamentos. Interface moderna e responsiva.',
        features: ['Carrinho de compras', 'Sistema de pagamento', 'Área de utilizador', 'Gestão de produtos'],
        technologies: ['HTML5', 'CSS3', 'JavaScript ES6+', 'LocalStorage', 'Fetch API'],
        date: '2025-01'
    },
    {
        id: 2,
        title: 'App de Tarefas',
        category: 'web',
        description: 'Gestor de tarefas com filtros e categorias',
        image: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Todo+App',
        tags: ['JavaScript', 'CSS', 'LocalStorage'],
        link: '#',
        longDescription: 'Aplicação de gestão de tarefas com sistema de prioridades, categorias e persistência local.',
        features: ['Adicionar/editar/remover tarefas', 'Filtros por estado', 'Categorias', 'Persistência de dados'],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'LocalStorage'],
        date: '2024-12'
    },
];

// Guarda a categoria atualmente selecionada no filtro.
// É uma variável global para que tanto filterProjects() como
// searchProjects() saibam qual o contexto ativo.
let currentCategory = 'all'; // 'all' = mostrar todos os projetos


// ============================================================
//  RENDERIZAR PROJETOS
// ============================================================

/**
 * renderProjects(projectsToRender)
 * Recebe um array de projetos e desenha os cards no HTML.
 *
 * CONCEITO — innerHTML vs appendChild():
 *   grid.innerHTML = '' → apaga TODO o conteúdo HTML do elemento de uma vez.
 *   É necessário fazer isto antes de redesenhar para não duplicar os cards.
 *   appendChild(elemento) → adiciona um único elemento filho no final.
 *
 * CONCEITO — forEach():
 *   Percorre cada item do array e executa uma função para cada um.
 *   projectsToRender.forEach(project => { ... })
 *   É como dizer "para cada projeto na lista, faz isto".
 *
 * CONCEITO — element.style.display:
 *   Controla a visibilidade via CSS inline.
 *   'block' → visível    'none' → escondido
 *
 * CONCEITO — return antecipado:
 *   Quando chamamos "return" a meio de uma função, a execução para
 *   naquele ponto e o resto da função não corre.
 */
function renderProjects(projectsToRender) {
    const grid      = document.getElementById('projects-grid');
    const noResults = document.getElementById('no-results');

    // Se a grelha não existir no HTML, sai sem fazer nada
    if (!grid) return;

    // Limpa todos os cards anteriores antes de redesenhar
    grid.innerHTML = '';

    // Se não há projetos para mostrar, exibe a mensagem "sem resultados"
    if (projectsToRender.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return; // Sai da função — não há mais nada a fazer
    }

    // Garante que a mensagem "sem resultados" está escondida
    if (noResults) noResults.style.display = 'none';

    // Para cada projeto, cria um card e adiciona-o à grelha
    projectsToRender.forEach(project => {
        const card = createProjectCard(project); // Cria o elemento HTML do card
        grid.appendChild(card);                  // Adiciona ao final da grelha
    });

    updateCounters(); // Atualiza os números nos botões de filtro
}

/**
 * createProjectCard(project)
 * Cria e devolve um elemento HTML <div> com os dados de um projeto.
 *
 * CONCEITO — document.createElement():
 *   Cria um novo elemento HTML em memória (ainda não está na página).
 *   Só fica visível depois de ser adicionado com appendChild().
 *
 * CONCEITO — dataset (atributos data-*):
 *   Permite guardar informação extra num elemento HTML:
 *   card.dataset.id = 1  →  gera data-id="1" no HTML
 *   Mais tarde, ao clicar no card, lemos card.dataset.id para saber
 *   qual projeto foi clicado.
 *
 * CONCEITO — Template Literals (crases ` `):
 *   Permitem escrever strings com variáveis embutidas: ${variavel}
 *   E também strings com múltiplas linhas sem precisar de \n.
 *
 * CONCEITO — .map().join(''):
 *   .map(tag => `<span>${tag}</span>`)  → transforma cada tag numa <span>
 *   .join('')  → junta todas as <span> numa única string sem separador
 *   Resultado: '<span>HTML</span><span>CSS</span><span>JS</span>'
 */
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className        = 'project-card';   // Classe CSS para o estilo
    card.dataset.id       = project.id;        // data-id para identificar no clique
    card.dataset.category = project.category;  // data-category (informação extra)

    // Define o HTML interno do card usando um template literal
    // loading="lazy" → a imagem só carrega quando ficar visível no ecrã
    card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" loading="lazy">
        <div class="project-card-body">
            <span class="project-category">${project.category}</span>
            <h3>${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;

    return card; // Devolve o elemento criado para ser adicionado à grelha
}

/**
 * updateCounters()
 * Atualiza os números nos botões de filtro (ex: "Web 3").
 *
 * CONCEITO — .filter():
 *   Cria um NOVO array com apenas os itens que passam no teste.
 *   projects.filter(p => p.category === 'web')
 *   → devolve um array só com os projetos de categoria 'web'
 *   "p => p.category === 'web'" é uma arrow function (função curta)
 *   === compara valor E tipo (preferir sempre === em vez de ==)
 *
 * CONCEITO — Object.keys(objeto):
 *   Devolve um array com todas as chaves (nomes) do objeto.
 *   Object.keys({all: 6, web: 3}) → ['all', 'web']
 *
 * CONCEITO — document.querySelector():
 *   Seleciona o PRIMEIRO elemento que corresponde ao seletor CSS.
 *   `[data-category="${cat}"] .count` → elemento com classe 'count'
 *   dentro do elemento que tem data-category igual a cat.
 */
function updateCounters() {
    const counts = {
        all:    projects.length,
        web:    projects.filter(p => p.category === 'web').length,
        mobile: projects.filter(p => p.category === 'mobile').length,
        design: projects.filter(p => p.category === 'design').length,
    };

    // Para cada categoria, atualiza o número no botão correspondente
    Object.keys(counts).forEach(cat => {
        const btn = document.querySelector(`[data-category="${cat}"] .count`);
        if (btn) btn.textContent = counts[cat];
    });
}

function filterProjects(category) {
    currentCategory = category; // Guarda para a pesquisa saber o contexto

    // Limpa o campo de pesquisa ao mudar o filtro
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Se 'all' → usa todos os projetos; senão filtra pela categoria
    const filtered = category === 'all'
        ? projects
        : projects.filter(p => p.category === category);

    renderProjects(filtered);
    console.log(`🏷️ Filtro: ${category} (${filtered.length} projetos)`);
}

function setupFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove a seleção de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Seleciona apenas o botão clicado
            button.classList.add('active');
            // Filtra os projetos pela categoria do botão (atributo data-category)
            filterProjects(button.dataset.category);
        });
    });
}

function openModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return; // Proteção: sai se o projeto não existir

    const modalBody = document.getElementById('modal-body');

    // Preenche o modal com o HTML dos detalhes do projeto
    modalBody.innerHTML = `
        <span class="modal-category">${project.category}</span>
        <h2 id="modal-title">${project.title}</h2>
        <img src="${project.image}" alt="${project.title}" class="modal-image">

        <div class="modal-section">
            <h3>Sobre o Projeto</h3>
            <p>${project.longDescription}</p>
        </div>

        <div class="modal-section">
            <h3>Funcionalidades</h3>
            <ul>
                ${project.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>

        <div class="modal-section">
            <h3>Tecnologias Utilizadas</h3>
            <div class="modal-tech">
                ${project.technologies.map(t => `<span class="tech-badge">${t}</span>`).join('')}
            </div>
        </div>

        <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="modal-link">
            Ver Projeto Completo →
        </a>
    `;

    // Torna o modal visível (o CSS usa a classe 'active' para display: flex)
    const modal = document.getElementById('project-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Bloqueia o scroll da página
    console.log(`🔍 Modal aberto: ${project.title}`);
}

/**
 * closeModal()
 * Fecha o modal e restaura o scroll da página.
 */
function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active'); // Remove 'active' → CSS aplica display: none
    document.body.style.overflow = '';  // Restaura o scroll normal da página
    console.log('Modal fechado');
}

function setupModalListeners() {
    // Event delegation no grid — um listener deteta cliques em qualquer card
    const grid = document.getElementById('projects-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (card) openModal(parseInt(card.dataset.id));
            // parseInt converte o data-id de string para número
        });
    }

    // Fechar ao clicar no botão × do modal
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Fechar ao clicar no fundo escuro (overlay) fora do conteúdo
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(); // Só fecha se clicou no overlay
        });
    }

    // Fechar com a tecla Escape (acessibilidade)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function debounce(func, delay) {
    let timeout; // Guarda o ID do temporizador ativo (ou undefined se não houver)
    return function (...args) {
        clearTimeout(timeout);  // Cancela o temporizador anterior
        timeout = setTimeout(() => func.apply(this, args), delay);
        // Inicia novo temporizador; só executa se não chegarem mais chamadas
    };
}

function searchProjects(query) {
    const term = query.toLowerCase().trim(); // Normaliza a pesquisa

    // Se a pesquisa estiver vazia, volta ao filtro de categoria ativo
    if (term === '') {
        filterProjects(currentCategory);
        return;
    }

    // Base: todos os projetos ou só os da categoria ativa
    const base = currentCategory === 'all'
        ? projects
        : projects.filter(p => p.category === currentCategory);

    // Filtra projetos que contenham o termo em título, descrição ou tags
    const results = base.filter(project =>
        project.title.toLowerCase().includes(term)       ||
        project.description.toLowerCase().includes(term) ||
        project.tags.some(tag => tag.toLowerCase().includes(term))
    );

    renderProjects(results);
    console.log(`🔎 Pesquisa: "${query}" — ${results.length} resultado(s)`);
}

const debouncedSearch = debounce(searchProjects, 280);

function setupSearchListener() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // A cada tecla, pesquisa com debounce (espera 280ms após última tecla)
    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Pressionar Escape: limpa a pesquisa e volta ao filtro ativo
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = ''; // Limpa o campo visualmente
            searchProjects('');      // Volta a mostrar todos da categoria ativa
            searchInput.blur();      // Remove o foco do campo
        }
    });
}

const validationRules = {
    name: {
        required: true,
        minLength: 3,
        pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
        messages: {
            required:  'Por favor, introduz o teu nome',
            minLength: 'O nome deve ter pelo menos 3 caracteres',
            pattern:   'O nome só pode conter letras'
        }
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        messages: {
            required: 'Por favor, introduz o teu email',
            pattern:  'Por favor, introduz um email válido'
        }
    },
    subject: {
        required: true,
        messages: {
            required: 'Por favor, seleciona um assunto'
        }
    },
    message: {
        required: true,
        minLength: 10,
        maxLength: 500,
        messages: {
            required:  'Por favor, escreve uma mensagem',
            minLength: 'A mensagem deve ter pelo menos 10 caracteres',
            maxLength: 'A mensagem não pode ter mais de 500 caracteres'
        }
    },
    phone: {
        required: false,
        // Aceita: 912345678 | +351912345678 | +351 912 345 678 | 912 345 678
        pattern: /^(\+351\s?)?([0-9]{3}\s?){3}$/,
        messages: {
            pattern: 'Formato inválido. Ex: 912345678 ou +351 912 345 678'
        }
    }
};

function validateField(fieldName, value) {
    const rules = validationRules[fieldName];
    if (!rules) return { valid: true, message: '' }; // Sem regras = válido

    // 1. Obrigatório e vazio?
    if (rules.required && !value.trim()) {
        return { valid: false, message: rules.messages.required };
    }
    // 2. Tem mínimo de caracteres?
    if (rules.minLength && value.trim().length < rules.minLength) {
        return { valid: false, message: rules.messages.minLength };
    }
    // 3. Excede o máximo de caracteres?
    if (rules.maxLength && value.trim().length > rules.maxLength) {
        return { valid: false, message: rules.messages.maxLength };
    }
    // 4. Corresponde ao padrão? (só testa se o campo não estiver vazio)
    if (rules.pattern && value.trim() && !rules.pattern.test(value)) {
        return { valid: false, message: rules.messages.pattern };
    }

    return { valid: true, message: '' }; // Passou em todas as verificações!
}

function showFieldFeedback(fieldName, isValid, message = '') {
    const field = document.getElementById(fieldName);
    if (!field) return;

    const group   = field.closest('.form-group');    // Container do campo
    const errorEl = group.querySelector('.error-message'); // Elemento do erro

    group.classList.remove('valid', 'invalid');              // Limpa estado anterior
    group.classList.add(isValid ? 'valid' : 'invalid');      // Aplica novo estado

    if (errorEl) errorEl.textContent = isValid ? '' : message; // Mostra/limpa erro
}

function validateForm(silent = false) {
    const fields = ['name', 'email', 'phone', 'subject', 'message'];
    let allValid = true; // Assume válido até encontrar um erro

    fields.forEach(name => {
        const field = document.getElementById(name);
        if (!field) return;

        const result = validateField(name, field.value);
        if (!silent) showFieldFeedback(name, result.valid, result.message);
        if (!result.valid) allValid = false; // Encontrou erro → formulário inválido
    });

    return allValid;
}

function updateSubmitButton() {
    const btn = document.getElementById('submit-btn');
    if (btn) btn.disabled = !validateForm(true);
}

function setupFormValidation() {
    const fields = ['name', 'email', 'phone', 'subject', 'message'];

    fields.forEach(name => {
        const field = document.getElementById(name);
        if (!field) return;

        // 'blur': valida ao sair do campo (primeira validação visual)
        field.addEventListener('blur', () => {
            const result = validateField(name, field.value);
            showFieldFeedback(name, result.valid, result.message);
            updateSubmitButton();
        });

        // 'input': valida enquanto escreve, mas só se o campo já foi tocado
        field.addEventListener('input', () => {
            const group = field.closest('.form-group');
            if (group.classList.contains('invalid') || group.classList.contains('valid')) {
                const result = validateField(name, field.value);
                showFieldFeedback(name, result.valid, result.message);
            }
            updateSubmitButton(); // Atualiza o botão sempre
        });
    });

    updateSubmitButton(); // O botão começa desativado
}

function setupCharCounter() {
    const textarea  = document.getElementById('message');
    const countEl   = document.getElementById('char-count');
    const counterEl = document.querySelector('.char-counter');
    if (!textarea || !countEl) return;

    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        countEl.textContent = len; // Atualiza o número visível

        counterEl.classList.remove('warning', 'error'); // Limpa estado anterior
        if (len > 400 && len <= 500) counterEl.classList.add('warning'); // Amarelo
        if (len > 500)               counterEl.classList.add('error');   // Vermelho

        updateSubmitButton(); // Desativa o botão se ultrapassar 500
    });
}

function showToast(type, title, message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`; // ex: 'toast toast-success'
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast); // Adiciona à página

    // Função que remove o toast com animação de saída
    const remove = () => {
        toast.style.animation = 'toastOut 0.35s ease forwards';
        setTimeout(() => toast.remove(), 350); // Aguarda a animação acabar
    };

    toast.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(() => { if (toast.parentElement) remove(); }, duration);
}

function saveMessage(formData) {
    // Lê mensagens existentes ou começa com array vazio
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];

    const msg = {
        id:      Date.now(),                    // ID único
        name:    formData.get('name'),
        email:   formData.get('email'),
        phone:   formData.get('phone') || null, // null se campo vazio
        subject: formData.get('subject'),
        message: formData.get('message'),
        date:    new Date().toISOString(),       // Data/hora em formato ISO
        read:    false                           // Ainda não lida pelo admin
    };

    messages.unshift(msg); // Adiciona no início (mais recente primeiro)
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    console.log('💾 Mensagem guardada:', msg);
    return msg;
}

function setupFormSubmit() {
    const form      = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o recarregamento da página

        // Valida o formulário antes de submeter; se inválido, mostra erros e para
        if (!validateForm()) {
            showToast('error', 'Erro!', 'Por favor, corrige os erros no formulário');
            return;
        }

        // Desativa o botão e mostra animação de carregamento
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            // Simula envio ao servidor (1.5 segundos de espera)
            await new Promise(resolve => setTimeout(resolve, 1500));

            const formData = new FormData(form);
            saveMessage(formData); // Guarda no localStorage

            showToast('success', 'Mensagem Enviada! 🎉',
                'Obrigado pelo contacto. Respondo em breve!');

            // Limpa o formulário após envio bem-sucedido
            form.reset(); // Reseta todos os campos
            document.querySelectorAll('.form-group').forEach(g =>
                g.classList.remove('valid', 'invalid')); // Remove cores de validação
            const charCount = document.getElementById('char-count');
            if (charCount) charCount.textContent = '0'; // Reseta contador

            loadMessages(); // Atualiza o badge do botão admin

        } catch {
            showToast('error', 'Erro ao Enviar', 'Ocorreu um erro. Tenta novamente.');
        } finally {
            // Sempre: reativa o botão e remove animação de carregamento
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            updateSubmitButton();
        }
    });
}

function markAllAsRead() {
    const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const updated  = messages.map(m => ({ ...m, read: true }));
    localStorage.setItem('contactMessages', JSON.stringify(updated));
}

function loadMessages(markRead = false) {
    if (markRead) markAllAsRead();

    const messages   = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const list       = document.getElementById('messages-list');
    const noMessages = document.getElementById('no-messages');
    const totalEl    = document.getElementById('total-messages');
    const badge      = document.getElementById('unread-badge');

    if (totalEl) totalEl.textContent = messages.length;

    // Atualiza o badge de mensagens não lidas
    const unread = messages.filter(m => !m.read).length;
    if (badge) {
        badge.textContent   = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none'; // Mostra ou esconde
    }

    if (!list || !noMessages) return;

    // Sem mensagens: mostra aviso
    if (messages.length === 0) {
        list.style.display       = 'none';
        noMessages.style.display = 'block';
        return;
    }

    list.style.display       = 'flex';
    noMessages.style.display = 'none';

    // Gera o HTML de todos os cards de mensagem de uma vez
    list.innerHTML = messages.map(msg => `
        <div class="message-card ${msg.read ? '' : 'unread'}" data-id="${msg.id}">
            <div class="message-header">
                <div class="message-sender">
                    <h4>${msg.name}</h4>
                    <p>${msg.email}</p>
                    ${msg.phone ? `<p class="msg-phone">📱 ${msg.phone}</p>` : ''}
                </div>
                <div class="message-meta">
                    <div>${new Date(msg.date).toLocaleDateString('pt-PT')}</div>
                    <div>${new Date(msg.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
            <span class="message-subject">${msg.subject}</span>
            <div class="message-body">${msg.message}</div>
            <div class="message-actions">
                <button class="btn-delete" data-id="${msg.id}">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');

    // Liga os botões de eliminar (após inserir o HTML)
    list.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteMessage(parseInt(btn.dataset.id)));
    });
}

function deleteMessage(id) {
    if (!confirm('Eliminar esta mensagem?')) return;
    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages = messages.filter(m => m.id !== id); // Remove a mensagem com este id
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    loadMessages(); // Atualiza a lista visível
    showToast('success', 'Eliminada!', 'Mensagem removida com sucesso');
}

function clearAllMessages() {
    if (!confirm('Eliminar TODAS as mensagens? Esta ação é irreversível!')) return;
    localStorage.removeItem('contactMessages'); // Apaga a chave completamente
    loadMessages();
    showToast('success', 'Limpo!', 'Todas as mensagens foram removidas');
}

/**
 * setupAdminToggle()
 * Controla a visibilidade do painel de administração.
 *
 * CONCEITO — Variável local como estado:
 *   'let visible = false' é uma variável local de setupAdminToggle().
 *   Guarda se o painel está visível ou não.
 *   Só existe dentro desta função — não "contamina" o espaço global.
 *
 * CONCEITO — .scrollIntoView({ behavior: 'smooth' }):
 *   Faz scroll suave até o elemento ficar visível no ecrã.
 *   Melhor experiência do que o scroll instantâneo padrão.
 */
function setupAdminToggle() {
    const toggleBtn = document.getElementById('toggle-admin');
    const adminSec  = document.getElementById('admin-messages');
    const clearBtn  = document.getElementById('clear-messages');
    if (!toggleBtn || !adminSec) return;

    let visible = false; // Estado inicial: painel escondido

    toggleBtn.addEventListener('click', () => {
        visible = !visible; // Alterna entre true e false
        adminSec.style.display = visible ? 'block' : 'none';
        if (visible) {
            loadMessages(true); // true → marcar como lidas ao abrir
            adminSec.scrollIntoView({ behavior: 'smooth' });
        }
    });

    if (clearBtn) clearBtn.addEventListener('click', clearAllMessages);
}


// ============================================================
//  INICIALIZAÇÃO — UM ÚNICO DOMContentLoaded
//
//  Por que ter apenas UM bloco DOMContentLoaded?
//  ─────────────────────────────────────────────
//  O browser aceita múltiplos listeners DOMContentLoaded e
//  executaria todos — tecnicamente funcionaria.
//
//  Mas ter um único bloco é a boa prática porque:
//    1. Clareza: o fluxo de arranque da página está num só sítio.
//    2. Manutenção: fácil de ver o que corre, em que ordem.
//    3. Profissionalismo: padrão usado em projetos reais.
//
//  Todas as sessões (2, 3 e 4) são inicializadas aqui em conjunto.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── Sessão 2: Tema claro/escuro ──────────────────────────
    loadSavedTheme(); // Aplica o tema guardado (ou deteta o do sistema)
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    // ── Sessão 2: Relógio digital ────────────────────────────
    loadClockFormat(); // Carrega o formato guardado (24h ou 12h)
    startClock();      // Inicia o relógio (atualiza a cada segundo)
    const formatToggleBtn = document.getElementById('format-toggle');
    if (formatToggleBtn) formatToggleBtn.addEventListener('click', toggleFormat);

    // ── Sessão 2: Contador de visitas ────────────────────────
    initVisitCounter(); // Regista a visita e atualiza os contadores
    const resetBtn = document.getElementById('reset-counter');
    if (resetBtn) resetBtn.addEventListener('click', resetVisitCounter);

    // ── Sessão 2: Footer ─────────────────────────────────────
    setFooterYear(); // Insere o ano atual no rodapé

    // ── Sessão 3: Galeria de projetos ────────────────────────
    renderProjects(projects);  // Desenha todos os projetos inicialmente
    setupFilterListeners();    // Liga os botões de filtro por categoria
    setupModalListeners();     // Liga o modal de detalhes dos projetos
    setupSearchListener();     // Liga a barra de pesquisa em tempo real

    // ── Sessão 4: Formulário de contacto ─────────────────────
    setupFormValidation(); // Liga a validação em tempo real por campo
    setupCharCounter();    // Liga o contador de caracteres da mensagem
    setupFormSubmit();     // Liga o evento de submissão do formulário
    setupAdminToggle();    // Liga o botão do painel de administração
    loadMessages();        // Carrega o badge com mensagens não lidas

    // ── Sessão 5: Integração com GitHub API ───────────────────
    initGitHubStats(); // Inicia a integração com a API do GitHub para mostrar stats
    initWeatherWidget(); // Inicia o widget de clima 

    console.log('✅ Portfolio totalmente carregado!');
});

// ===== FETCH COM ASYNC/AWAIT (MODERNA - RECOMENDADA) =====
async function buscarDados() {
    try {
        const response = await fetch('https://api.github.com/users/github');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Erro:', error);
    }
}

buscarDados();

// ===== PRIMEIRO FETCH - TESTE =====

async function testarFetch() {
    console.log('🚀 Iniciando fetch...');
    
    try {
        // 1. Fazer o pedido
        const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
        
        // 2. Verificar se resposta é OK (status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 3. Parsear JSON
        const data = await response.json();
        
        // 4. Usar os dados
        console.log('✅ Dados recebidos:', data);
        console.log('Nome:', data.name);
        console.log('Email:', data.email);
        console.log('Cidade:', data.address.city);
        
        return data;
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
    }
}

// Testar no console
testarFetch();
// ===== MOSTRAR DADOS NO DOM =====

async function buscarEMostrar() {
    const resultDiv = document.getElementById('result');
    const btn = document.getElementById('fetch-btn');
    
    // Loading state
    btn.disabled = true;
    btn.textContent = 'Carregando...';
    resultDiv.innerHTML = '<p>⏳ A buscar dados...</p>';
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        
        const user = await response.json();
        
        // Mostrar dados
        resultDiv.innerHTML = `
            <div class="user-card">
                <h3>${user.name}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Cidade:</strong> ${user.address.city}</p>
                <p><strong>Website:</strong> ${user.website}</p>
            </div>
        `;
        
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="error">
                <p>❌ Erro ao buscar dados</p>
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        // Sempre executado
        btn.disabled = false;
        btn.textContent = 'Buscar Dados';
    }
}

// Event listener
document.getElementById('fetch-btn')?.addEventListener('click', buscarEMostrar);

// ===== GITHUB API INTEGRATION =====

const GITHUB_USERNAME = 'FernandoA74';

// Buscar dados do utilizador
async function fetchGitHubUserData() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ GitHub user data:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Erro ao buscar GitHub user:', error);
        throw error;
    }
}

// Atualizar stats no DOM
function updateGitHubStats(userData) {
    document.getElementById('repos-count').textContent = userData.public_repos;
    document.getElementById('followers-count').textContent = userData.followers;
    document.getElementById('following-count').textContent = userData.following;
    
    // Remover classe loading
    document.querySelectorAll('.stat-value').forEach(el => {
        el.classList.remove('loading');
    });
}
// Buscar repositórios do utilizador
async function fetchGitHubRepos() {
    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stars&per_page=6`
        );
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const repos = await response.json();
        
        console.log('✅ GitHub repos:', repos);
        return repos;
        
    } catch (error) {
        console.error('❌ Erro ao buscar repos:', error);
        throw error;
    }
}

// Calcular total de stars
async function calculateTotalStars() {
    try {
        const repos = await fetchGitHubRepos();
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        
        document.getElementById('stars-count').textContent = totalStars;
        
        return repos;
    } catch (error) {
        document.getElementById('stars-count').textContent = '0';
        throw error;
    }
}

// Renderizar repositórios
function renderRepos(repos) {
    const grid = document.getElementById('repos-grid');
    
    grid.innerHTML = repos.map(repo => `
        

            

                
📦

                

                    
${repo.name}

                

            

            

                ${repo.description || 'Sem descrição'}
            


            

                ⭐ ${repo.stargazers_count}
                🔀 ${repo.forks_count}
            

            ${repo.language ? `${repo.language}` : ''}
        

    `).join('');
}

// ===== INICIALIZAR GITHUB STATS =====

async function initGitHubStats() {
    console.log('🐙 Carregando GitHub stats...');
    
    try {
        // Buscar dados em paralelo
        const [userData, repos] = await Promise.all([
            fetchGitHubUserData(),
            calculateTotalStars()
        ]);
        
        // Atualizar UI
        updateGitHubStats(userData);
        renderRepos(repos);
        
        console.log('✅ GitHub stats carregados!');
        
    } catch (error) {
        console.error('❌ Erro ao carregar GitHub stats');
        // Mostrar erro na UI
        document.querySelectorAll('.stat-value').forEach(el => {
            el.textContent = '--';
            el.classList.remove('loading');
        });
    }
}
// ===== CACHE SIMPLES =====

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Verificar se cache ainda é válido
    if (now - timestamp < CACHE_DURATION) {
        console.log(`✅ Usando cache para ${key}`);
        return data;
    }
    
    // Cache expirado
    localStorage.removeItem(key);
    return null;
}

function setCachedData(key, data) {
    const cacheObj = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheObj));
}

// Atualizar fetchGitHubUserData para usar cache
async function fetchGitHubUserData() {
    const cacheKey = `github_user_${GITHUB_USERNAME}`;
    
    // Tentar obter do cache primeiro
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    // Se não tem cache, buscar da API
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Guardar no cache
        setCachedData(cacheKey, data);
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao buscar GitHub user:', error);
        throw error;
    }
}
const OPENWEATHER_API_KEY = '9a020b3300c37c0ba92320694aaf5d75070a268eb8ce73c9991aacd2f253cad7'; // ALTERAR!
const DEFAULT_CITY = 'Lisbon'; // Cidade padrão se geolocalização falhar

// Mapeamento de códigos para emojis
const weatherIcons = {
    '01d': '☀️',  // clear sky day
    '01n': '🌙',  // clear sky night
    '02d': '⛅',  // few clouds day
    '02n': '☁️',  // few clouds night
    '03d': '☁️',  // scattered clouds
    '03n': '☁️',
    '04d': '☁️',  // broken clouds
    '04n': '☁️',
    '09d': '🌧️',  // shower rain
    '09n': '🌧️',
    '10d': '🌦️',  // rain day
    '10n': '🌧️',  // rain night
    '11d': '⛈️',  // thunderstorm
    '11n': '⛈️',
    '13d': '❄️',  // snow
    '13n': '❄️',
    '50d': '🌫️',  // mist
    '50n': '🌫️'
};

// Buscar meteorologia por cidade
async function fetchWeatherByCity(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt`
        );
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Weather data:', data);
        
        return data;
        
    } catch (error) {
        console.error('❌ Erro ao buscar meteorologia:', error);
        throw error;
    }
}

// Buscar meteorologia por coordenadas
async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt`
        );
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('❌ Erro ao buscar meteorologia:', error);
        throw error;
    }
}

// Atualizar UI do widget
function updateWeatherWidget(data) {
    const widget = document.getElementById('weather-widget');
    const loading = widget.querySelector('.weather-loading');
    const content = widget.querySelector('.weather-content');
    const error = widget.querySelector('.weather-error');
    
    // Esconder loading e error
    loading.style.display = 'none';
    error.style.display = 'none';
    
    // Atualizar dados
    document.getElementById('temp').textContent = Math.round(data.main.temp);
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    document.getElementById('weather-location').textContent = data.name;
    
    // Atualizar ícone
    const iconCode = data.weather[0].icon;
    const icon = weatherIcons[iconCode] || '🌈';
    document.getElementById('weather-icon').textContent = icon;
    
    // Mostrar content
    content.style.display = 'flex';
}

// Mostrar erro
function showWeatherError() {
    const widget = document.getElementById('weather-widget');
    widget.querySelector('.weather-loading').style.display = 'none';
    widget.querySelector('.weather-content').style.display = 'none';
    widget.querySelector('.weather-error').style.display = 'block';
}
// ===== INICIALIZAR WEATHER WIDGET =====

async function initWeatherWidget() {
    console.log('🌤️ Carregando meteorologia...');
    
    try {
        // Tentar obter localização do utilizador
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // Sucesso
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const data = await fetchWeatherByCoords(latitude, longitude);
                    updateWeatherWidget(data);
                },
                // Erro ou negado
                async (error) => {
                    console.log('Geolocalização negada, usando cidade padrão');
                    const data = await fetchWeatherByCity(DEFAULT_CITY);
                    updateWeatherWidget(data);
                }
            );
        } else {
            // Browser não suporta geolocalização
            const data = await fetchWeatherByCity(DEFAULT_CITY);
            updateWeatherWidget(data);
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar meteorologia');
        showWeatherError();
    }
}
// ===== ERROR HANDLING AVANÇADO =====

// Função para lidar com erros de API
function handleAPIError(error, apiName) {
    console.error(`❌ Erro na ${apiName} API:`, error);
    
    // Diferentes tipos de erro
    if (error.message.includes('Failed to fetch')) {
        showToast('error', 'Sem Conexão', `Verifica a tua ligação à internet`);
    } else if (error.message.includes('404')) {
        showToast('error', 'Não Encontrado', `${apiName}: Recurso não encontrado`);
    } else if (error.message.includes('429')) {
        showToast('error', 'Rate Limit', `${apiName}: Muitos pedidos. Tenta mais tarde.`);
    } else if (error.message.includes('403')) {
        showToast('error', 'Acesso Negado', `${apiName}: Verifica API key`);
    } else {
        showToast('error', 'Erro', `${apiName}: ${error.message}`);
    }
}

// Atualizar fetchs para usar handleAPIError
async function fetchGitHubUserData() {
    const cacheKey = `github_user_${GITHUB_USERNAME}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setCachedData(cacheKey, data);
        return data;
        
    } catch (error) {
        handleAPIError(error, 'GitHub');
        throw error;
    }
}
// ===== RETRY LOGIC =====

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return response;
            
        } catch (error) {
            // Última tentativa - lançar erro
            if (i === maxRetries - 1) {
                throw error;
            }
            
            // Esperar antes de retry (exponential backoff)
            const delay = Math.pow(2, i) * 1000;
            console.log(`Retry ${i + 1}/${maxRetries} após ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Usar em fetchs
async function fetchGitHubUserData() {
    // ... cache code ...
    
    try {
        const response = await fetchWithRetry(
            `https://api.github.com/users/${GITHUB_USERNAME}`
        );
        const data = await response.json();
        // ... resto
    } catch (error) {
        handleAPIError(error, 'GitHub');
        throw error;
    }
}