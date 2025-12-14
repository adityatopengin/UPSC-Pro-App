/**
 * page-dashboard.js
 * Dashboard-specific logic for index.html
 * Final Production Version
 */

let dashboardState = {
    currentTab: 'gs1',
    history: []
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load history using DataManager
        if (window.appData) {
            dashboardState.history = appData.getLocalHistory();
        }
        
        // Initialize UI
        updateDashboardStats();
        renderSubjectGrid('gs1');
        
        console.log('Dashboard initialized');
    } catch (e) {
        console.error('Dashboard init failed:', e);
    }
});

/**
 * Switch between GS1 and CSAT tabs
 */
function switchTab(tab) {
    dashboardState.currentTab = tab;
    
    // Update tab styles
    const gs1Tab = document.getElementById('tab-gs1');
    const csatTab = document.getElementById('tab-csat');
    
    if (tab === 'gs1') {
        gs1Tab.classList.add('tab-active', 'font-bold', 'text-slate-900', 'border-b-2', 'border-blue-600');
        gs1Tab.classList.remove('text-slate-600');
        
        csatTab.classList.remove('tab-active', 'font-bold', 'text-slate-900', 'border-b-2', 'border-blue-600');
        csatTab.classList.add('text-slate-600');
    } else {
        csatTab.classList.add('tab-active', 'font-bold', 'text-slate-900', 'border-b-2', 'border-blue-600');
        csatTab.classList.remove('text-slate-600');
        
        gs1Tab.classList.remove('tab-active', 'font-bold', 'text-slate-900', 'border-b-2', 'border-blue-600');
        gs1Tab.classList.add('text-slate-600');
    }
    
    // Rerender grid
    renderSubjectGrid(tab);
}

/**
 * Render subject grid
 */
function renderSubjectGrid(tab) {
    const container = document.getElementById('subject-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get subjects from subjects.js
    const subjects = tab === 'gs1' ? subjectsGS1 : subjectsCSAT;
    
    subjects.forEach((sub, index) => {
        // PRODUCTION FIX: Use exact match for accurate stats
        const attempts = dashboardState.history
            .filter(h => h.subject === sub.name) 
            .reduce((sum, h) => sum + (h.total || 0), 0);
        
        // PRODUCTION FIX: Fixed variable name syntax error
        const totalAvailable = 500; 
        const percent = Math.min(100, Math.round((attempts / totalAvailable) * 100));
        
        // Dynamic Color Logic
        const iconColorClass = sub.color ? `bg-${sub.color}-50 text-${sub.color}-500` : 'bg-blue-50 text-blue-500';
        const barColorClass = sub.color ? `bg-${sub.color}-500` : 'bg-blue-500';

        // Create card
        const card = document.createElement('div');
        card.className = 'card bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95 animate-fade-up';
        card.style.animationDelay = `${index * 50}ms`;
        card.onclick = () => {
            // Set global variables for ui-common.js to use
            window.currentMode = 'test';
            window.currentPaper = tab;
            openTopicModal(sub, tab);
        };
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${iconColorClass} flex items-center justify-center">
                    <i class="fa-solid ${sub.icon}"></i>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">${tab.toUpperCase()}</span>
            </div>
            <h4 class="font-bold text-sm text-slate-800 truncate">${sub.name}</h4>
            <div class="mt-3 flex items-center gap-2">
                <div class="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full ${barColorClass}" style="width: ${percent}%"></div>
                </div>
                <span class="text-[9px] font-bold text-slate-400">${attempts} Qs</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Update dashboard stats from history
 */
function updateDashboardStats() {
    let totalQs = 0;
    
    dashboardState.history.forEach(h => {
        totalQs += (h.total || 0);
    });
    
    const attemptsDisplay = document.getElementById('total-attempts');
    if (attemptsDisplay) attemptsDisplay.innerText = totalQs;
    
    // Main progress
    const totalAppQs = 2000;
    const mainPercent = Math.min(100, Math.round((totalQs / totalAppQs) * 100));
    
    const sylPercent = document.getElementById('syllabus-percent');
    if (sylPercent) sylPercent.innerText = mainPercent + '%';
    
    const progFrac = document.getElementById('progress-fraction');
    if (progFrac) progFrac.innerText = `${totalQs} / ${totalAppQs} Qs`;
    
    const mainBar = document.getElementById('main-progress-bar');
    if (mainBar) mainBar.style.width = `${mainPercent}%`;
}

