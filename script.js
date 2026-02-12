console.log('🚀 Portfolio carregado com sucesso!');

// Teste: mudar cor de fundo ao clicar
document.body.addEventListener('click', () => {
    console.log('Clicaste na página!');
});

// ===== DARK MODE TOGGLE =====

// 1. Função para alternar tema
function toggleTheme() {
    // Adiciona/remove classe dark-mode do body
    document.body.classList.toggle('dark-mode');
    
    // Verifica se está em dark mode
    const isDark = document.body.classList.contains('dark-mode');
    
    // Guarda preferência no localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    console.log(`Tema alterado para: ${isDark ? 'escuro' : 'claro'}`);
}

// 2. Event listener no botão
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// 3. Carregar tema guardado ao iniciar
function loadSavedTheme() {
    // Buscar tema do localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Se tiver tema guardado como 'dark', ativa dark mode
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    console.log(`Tema carregado: ${savedTheme || 'padrão (light)'}`);
}

// 4. Executar quando página carrega
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
});

// ===== RELÓGIO DIGITAL =====

// Variável global para formato (true = 24h, false = 12h)
let is24Hour = true;

// 1. Função para atualizar o relógio
function updateClock() {
    // Obter hora atual
    const now = new Date();
    
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    
    // Converter para 12h se necessário
    if (!is24Hour) {
        hours = hours % 12 || 12; // 0 vira 12
    }
    
    // Adicionar zero à esquerda se < 10
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    
    // Atualizar DOM
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}
// 2. Variável para guardar o intervalo
let clockInterval;

// 3. Função para iniciar o relógio
function startClock() {
    // Atualizar imediatamente
    updateClock();
    
    // Atualizar a cada 1000ms (1 segundo)
    clockInterval = setInterval(updateClock, 1000);
    
    console.log('⏰ Relógio iniciado!');
}

// 4. Iniciar quando página carrega
document.addEventListener('DOMContentLoaded', () => {
    startClock();
});
function stopClock() { if (clockInterval) { clearInterval(clockInterval); console.log('⏰ Relógio parado!'); } }
// 5. Função para alternar formato
function toggleFormat() {
    is24Hour = !is24Hour;
    
    // Guardar preferência
    localStorage.setItem('clockFormat', is24Hour ? '24' : '12');
    
    // Atualizar imediatamente
    updateClock();
    
    console.log(`Formato: ${is24Hour ? '24h' : '12h'}`);
}

// 6. Event listener no botão
const formatToggle = document.getElementById('format-toggle');
if (formatToggle) {
    formatToggle.addEventListener('click', toggleFormat);
}

// 7. Carregar formato guardado
function loadClockFormat() {
    const saved = localStorage.getItem('clockFormat');
    if (saved) {
        is24Hour = (saved === '24');
    }
}

// Adicionar ao DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadClockFormat();
    startClock();
});
// ===== CONTADOR DE VISITAS =====

// 1. Função para obter contagem atual
function getVisitCount() {
    // Buscar do localStorage (retorna string ou null)
    const count = localStorage.getItem('visitCount');
    
    // Converter para número (ou 0 se não existir)
    return count ? parseInt(count) : 0;
}

// 2. Função para incrementar visitas
function incrementVisitCount() {
    // Obter contagem atual
    let count = getVisitCount();
    
    // Incrementar
    count++;
    
    // Guardar nova contagem
    localStorage.setItem('visitCount', count);
    
    // Guardar timestamp da visita
    const now = new Date().toISOString();
    localStorage.setItem('lastVisit', now);
    
    return count;
}

// 3. Função para atualizar o display
function updateVisitDisplay() {
    const count = getVisitCount();
    
    // Atualizar número
    const countElement = document.getElementById('visit-count');
    if (countElement) {
        countElement.textContent = count;
    }
    
    console.log(`📊 Visitas: ${count}`);
}// 4. Função para formatar data
function formatLastVisit() {
    const lastVisitISO = localStorage.getItem('lastVisit');
    
    if (!lastVisitISO) {
        return 'Primeira vez aqui! 🎉';
    }
    
    const lastVisit = new Date(lastVisitISO);
    const now = new Date();
    
    // Calcular diferença em milissegundos
    const diff = now - lastVisit;
    
    // Converter para minutos/horas/dias
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Há menos de 1 minuto';
    if (minutes < 60) return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
    return `Há ${days} dia${days > 1 ? 's' : ''}`;
}

// 5. Atualizar display da última visita
function updateLastVisitDisplay() {
    const lastVisitText = formatLastVisit();
    
    const lastVisitElement = document.getElementById('last-visit');
    if (lastVisitElement) {
        lastVisitElement.textContent = lastVisitText;
    }
}

// 6. Função para inicializar o contador
function initVisitCounter() {
    // Incrementar visitas
    incrementVisitCount();
    
    // Atualizar displays
    updateVisitDisplay();
    updateLastVisitDisplay();
    
    console.log('📊 Contador de visitas inicializado!');
}

// 7. Executar quando página carrega
document.addEventListener('DOMContentLoaded', () => {
    initVisitCounter();
    // ... outras inicializações
});

// 8. Função para resetar contador
function resetVisitCounter() {
    // Confirmar com utilizador
    const confirm = window.confirm('Tens a certeza que queres resetar o contador?');
    
    if (confirm) {
        // Limpar localStorage
        localStorage.removeItem('visitCount');
        localStorage.removeItem('lastVisit');
        
        // Atualizar displays
        updateVisitDisplay();
        updateLastVisitDisplay();
        
        console.log('🔄 Contador resetado!');
        
        // Feedback visual
        alert('Contador resetado com sucesso!');
    }
}

// 9. Event listener no botão
const resetBtn = document.getElementById('reset-counter');
if (resetBtn) {
    resetBtn.addEventListener('click', resetVisitCounter);
}
// ===== DADOS DOS PROJETOS =====

const projects = [
    {
        id: 1,
        title: 'E-commerce Website',
        category: 'web',
        description: 'Loja online completa com carrinho de compras',
        image: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=E-commerce',
        tags: ['HTML', 'CSS', 'JavaScript', 'API'],
        link: 'https://github.com/...',
        longDescription: 'Website de e-commerce completo com sistema de carrinho, checkout, e integração com API de pagamentos. Interface moderna e responsiva.',
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
        tags: ['React', 'CSS', 'LocalStorage'],
        link: 'https://github.com/...',
        longDescription: 'Aplicação de gestão de tarefas com sistema de prioridades, categorias e persistência local.',
        features: ['Adicionar/editar/remover tarefas', 'Filtros por estado', 'Categorias', 'Persistência de dados'],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'LocalStorage'],
        date: '2024-12'
    },
    {
        id: 3,
        title: 'Portfolio Designer',
        category: 'design',
        description: 'Portfolio criativo para designer gráfico',
        image: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Portfolio',
        tags: ['Figma', 'UI/UX', 'Protótipo'],
        link: 'https://figma.com/...',
        longDescription: 'Design de portfolio minimalista e elegante para apresentar trabalhos criativos.',
        features: ['Design responsivo', 'Animações suaves', 'Galeria de trabalhos', 'Formulário de contacto'],
        technologies: ['Figma', 'Design System', 'Prototyping'],
        date: '2024-11'
    },
    {
        id: 4,
        title: 'App Meteorologia',
        category: 'mobile',
        description: 'App mobile para consultar previsão do tempo',
        image: 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Weather+App',
        tags: ['React Native', 'API', 'Mobile'],
        link: 'https://github.com/...',
        longDescription: 'Aplicação mobile para consultar previsão meteorológica com dados em tempo real.',
        features: ['Previsão 7 dias', 'Localização automática', 'Alertas meteorológicos', 'Favoritos'],
        technologies: ['React Native', 'Weather API', 'Geolocation'],
        date: '2025-01'
    },
    {
        id: 5,
        title: 'Dashboard Analytics',
        category: 'web',
        description: 'Dashboard com gráficos e estatísticas',
        image: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Dashboard',
        tags: ['Vue.js', 'Charts', 'API'],
        link: 'https://github.com/...',
        longDescription: 'Dashboard interativo para visualização de dados e analytics com gráficos dinâmicos.',
        features: ['Gráficos interativos', 'Filtros de data', 'Exportar relatórios', 'Tempo real'],
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'Chart.js', 'API'],
        date: '2024-10'
    },
    {
        id: 6,
        title: 'Redesign Logo Empresa',
        category: 'design',
        description: 'Redesign de identidade visual corporativa',
        image: 'https://via.placeholder.com/400x300/ec4899/ffffff?text=Logo+Design',
        tags: ['Illustrator', 'Branding', 'Logo'],
        link: 'https://behance.net/...',
        longDescription: 'Projeto de redesign completo de identidade visual incluindo logo, cores e tipografia.',
        features: ['Logo principal', 'Variações', 'Manual de marca', 'Mockups'],
        technologies: ['Adobe Illustrator', 'Photoshop', 'InDesign'],
        date: '2024-09'
    }
];

// Variável global para controlar filtro atual
let currentCategory = 'all';
// ===== RENDERIZAR PROJETOS =====

function renderProjects(projectsToRender) {
    const grid = document.getElementById('projects-grid');
    const noResults = document.getElementById('no-results');
    
    // Limpar grid
    grid.innerHTML = '';
    
    // Se não há projetos, mostrar mensagem
    if (projectsToRender.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Criar card para cada projeto
    projectsToRender.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });
    
    // Atualizar contadores
    updateCounters();
}

// Criar HTML de um card
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = project.id;
    card.dataset.category = project.category;
    
    // Template string com HTML do card
    card.innerHTML = `
        <img src="${project.image}" alt="${project.title}">
        <div class="project-card-body">
            <span class="project-category">${project.category}</span>
            <h3>${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    return card;
}

// Atualizar números nos botões de filtro
function updateCounters() {
    const allCount = projects.length;
    const webCount = projects.filter(p => p.category === 'web').length;
    const mobileCount = projects.filter(p => p.category === 'mobile').length;
    const designCount = projects.filter(p => p.category === 'design').length;
    
    document.querySelector('[data-category="all"] .count').textContent = allCount;
    document.querySelector('[data-category="web"] .count').textContent = webCount;
    document.querySelector('[data-category="mobile"] .count').textContent = mobileCount;
    document.querySelector('[data-category="design"] .count').textContent = designCount;
}

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', () => {
    renderProjects(projects);
    console.log('✅ Projetos renderizados!');
});