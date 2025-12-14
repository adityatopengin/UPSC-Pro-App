/**
 * page-selection.js
 * Quiz selection page logic
 * Final Production Version
 */

let selectionState = {
    mode: 'test',
    paper: 'gs1',
    selectedSubject: null,
    selectedTopic: 'All Topics',
    questionCount: 10
};

document.addEventListener('DOMContentLoaded', () => {
    renderSubjects('gs1');
    renderSubjects('csat');
    
    // Check global state if returning from dashboard
    if (window.currentMode) selectMode(window.currentMode);
    if (window.currentPaper) selectPaper(window.currentPaper);
});

/**
 * Render subjects for a paper
 */
function renderSubjects(paper) {
    const containerId = paper === 'gs1' ? 'gs1-subjects' : 'csat-subjects';
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get list from subjects.js
    const subjects = paper === 'gs1' ? subjectsGS1 : subjectsCSAT;
    
    subjects.forEach(sub => {
        const card = document.createElement('div');
        card.className = 'card bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-all active:scale-95';
        card.onclick = () => {
            window.currentMode = selectionState.mode;
            window.currentPaper = paper;
            // Use function from ui-common.js
            openTopicModal(sub, paper);
        };
        
        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    <i class="fa-solid ${sub.icon}"></i>
                </div>
                <span class="font-bold text-sm text-slate-700">${sub.name}</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Select quiz mode
 */
function selectMode(mode) {
    selectionState.mode = mode;
    window.currentMode = mode;
    
    const learningEl = document.getElementById('mode-learning');
    const testEl = document.getElementById('mode-test');
    
    if (mode === 'learning') {
        learningEl.className = 'card bg-blue-50 p-4 rounded-xl cursor-pointer border-2 border-blue-600 transition-all';
        learningEl.querySelector('i').className = 'fa-solid fa-book-open-reader text-2xl text-blue-600 mb-2';
        
        testEl.className = 'card bg-white p-4 rounded-xl cursor-pointer border-2 border-slate-100 hover:border-blue-300 transition-all';
        testEl.querySelector('i').className = 'fa-solid fa-stopwatch text-2xl text-slate-300 mb-2';
        
        const badge = testEl.querySelector('.absolute');
        if (badge) badge.remove();
        
    } else {
        testEl.className = 'card bg-blue-50 p-4 rounded-xl cursor-pointer border-2 border-blue-600 transition-all relative';
        testEl.querySelector('i').className = 'fa-solid fa-stopwatch text-2xl text-blue-600 mb-2';
        
        if (!testEl.querySelector('.absolute')) {
            const badge = document.createElement('div');
            badge.className = 'absolute top-2 right-2 text-blue-600 text-xs';
            badge.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            testEl.appendChild(badge);
        }
        
        learningEl.className = 'card bg-white p-4 rounded-xl cursor-pointer border-2 border-slate-100 hover:border-blue-300 transition-all';
        learningEl.querySelector('i').className = 'fa-solid fa-book-open-reader text-2xl text-slate-300 mb-2';
    }
}

/**
 * Select paper (GS1 or CSAT)
 */
function selectPaper(paper) {
    selectionState.paper = paper;
    window.currentPaper = paper;
    
    const tab1 = document.getElementById('tab-gs1');
    const tab2 = document.getElementById('tab-csat');
    const content1 = document.getElementById('content-gs1');
    const content2 = document.getElementById('content-csat');
    
    if (paper === 'gs1') {
        tab1.classList.add('active', 'border-blue-600', 'text-slate-900');
        tab1.classList.remove('text-slate-500');
        
        tab2.classList.remove('active', 'border-blue-600', 'text-slate-900');
        tab2.classList.add('text-slate-500');
        
        content1.classList.remove('hidden');
        content2.classList.add('hidden');
    } else {
        tab2.classList.add('active', 'border-blue-600', 'text-slate-900');
        tab2.classList.remove('text-slate-500');
        
        tab1.classList.remove('active', 'border-blue-600', 'text-slate-900');
        tab1.classList.add('text-slate-500');
        
        content2.classList.remove('hidden');
        content1.classList.add('hidden');
    }
}

/**
 * Open mock modal
 */
function openMockModal(paper) {
    selectionState.paper = paper;
    // Use ui-common helper
    openModal('mock-modal');
    
    // Update labels
    document.getElementById('mock-subtitle').innerText = 
        paper === 'gs1' ? 'GS Paper 1 - Mock Test' : 'CSAT Paper 2 - Mock Test';
    
    if (paper === 'gs1') {
        document.getElementById('half-desc').innerText = '50 Questions • 100 Marks';
        document.getElementById('full-desc').innerText = '100 Questions • 200 Marks';
    } else {
        document.getElementById('half-desc').innerText = '40 Questions • 100 Marks';
        document.getElementById('full-desc').innerText = '80 Questions • 200 Marks';
    }
}

/**
 * Start mock test
 */
function startMock(length) {
    let count = 0;
    
    if (selectionState.paper === 'gs1') {
        count = length === 'half' ? 50 : 100;
    } else {
        count = length === 'half' ? 40 : 80;
    }

    const config = {
        mode: selectionState.mode,
        paper: selectionState.paper,
        subject: 'Mock Test', // Special subject triggering mock logic
        topic: length === 'half' ? 'Half Length' : 'Full Length',
        count: count
    };
    
    saveQuizConfig(config);
    closeModal('mock-modal');
    window.location.href = 'quiz_interface.html';
}

/**
 * Start quick quiz
 */
function startQuickQuiz(paper, type) {
    let subject = 'Quick Practice';
    let topic = 'Random Selection';
    
    if (type === 'mistakes') {
        // Validation: Check if mistakes exist
        const mistakes = getMistakeQuestions(10);
        if (mistakes.length === 0) {
            alert('No mistakes in your bank yet. Try random practice!');
            return;
        }
        subject = 'Mistake Review';
        topic = 'Re-attempt Wrong';
        // Pass mistakes via localStorage to quiz interface
        localStorage.setItem('upsc_quick_questions', JSON.stringify(mistakes));
    }
    
    const config = {
        mode: selectionState.mode,
        paper: paper,
        subject: subject,
        topic: topic,
        count: 10,
        quickType: type // 'mistakes' or 'random'
    };
    
    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

function goHome() {
    window.location.href = 'index.html';
}

