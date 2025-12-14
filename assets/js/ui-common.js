/**
 * ui-common.js
 * Shared UI behaviors: modals, selections, feedback
 * Final Production Version
 */

let uiState = {
    selectedSubject: null,
    selectedTopic: 'All Topics',
    questionCount: 10
};

/**
 * Open topic selection modal
 */
function openTopicModal(subject, paper = 'gs1') {
    uiState.selectedSubject = subject;
    
    // Create modal on demand if it doesn't exist
    if (!document.getElementById('topic-modal')) {
        createTopicModal();
    }
    
    const modal = document.getElementById('topic-modal');
    
    // Update modal content
    document.getElementById('m-subject-tag').innerText = paper.toUpperCase();
    document.getElementById('m-subject-title').innerText = subject.name;
    
    // Render subtopics
    const container = document.getElementById('m-subtopics');
    container.innerHTML = '';
    
    if (subject.topics && subject.topics.length > 0) {
        subject.topics.forEach((topic, i) => {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors';
            label.innerHTML = `
                <input type="radio" name="subtopic" value="${topic}" ${i === 0 ? 'checked' : ''} 
                       onchange="uiState.selectedTopic = this.value" class="w-4 h-4 accent-blue-600">
                <span class="text-sm font-medium text-slate-700">${topic}</span>
            `;
            container.appendChild(label);
        });
        uiState.selectedTopic = subject.topics[0];
    } else {
        container.innerHTML = '<p class="text-xs text-slate-400">No specific topics available.</p>';
        uiState.selectedTopic = 'All Topics';
    }
    
    // Reset Question Count to 10
    selectQuestionCount(10, document.querySelector('.q-count-btn'));

    // Show modal with animation
    modal.classList.remove('hidden');
    void modal.offsetWidth; // Trigger reflow
    document.getElementById('topic-bg').classList.remove('opacity-0');
    document.getElementById('topic-content').classList.remove('translate-y-full');
}

function closeTopicModal() {
    const bg = document.getElementById('topic-bg');
    const content = document.getElementById('topic-content');
    
    if(bg) bg.classList.add('opacity-0');
    if(content) content.classList.add('translate-y-full');
    
    setTimeout(() => {
        const modal = document.getElementById('topic-modal');
        if(modal) modal.classList.add('hidden');
    }, 300);
}

/**
 * Inject Modal HTML
 */
function createTopicModal() {
    if (document.getElementById('topic-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'topic-modal';
    modal.className = 'fixed inset-0 z-50 hidden flex items-end sm:items-center justify-center pointer-events-none';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity opacity-0 pointer-events-auto" 
             id="topic-bg" onclick="closeTopicModal()"></div>
        <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl transform translate-y-full 
                    transition-transform duration-300 pointer-events-auto flex flex-col max-h-[85vh]" 
             id="topic-content">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-xs font-bold text-blue-600 uppercase tracking-wide" id="m-subject-tag">GS1</span>
                    <h2 class="text-xl font-bold text-slate-900 mt-1" id="m-subject-title">Subject</h2>
                </div>
                <button onclick="closeTopicModal()" class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="p-6 overflow-y-auto space-y-6">
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Topic</label>
                    <div class="space-y-2 max-h-40 overflow-y-auto" id="m-subtopics"></div>
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase mb-2 block">Number of Questions</label>
                    <div class="grid grid-cols-4 gap-2">
                        <button onclick="selectQuestionCount(10, this)" class="q-count-btn active bg-slate-900 text-white py-2 rounded-lg font-bold text-sm">10</button>
                        <button onclick="selectQuestionCount(20, this)" class="q-count-btn bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-200">20</button>
                        <button onclick="selectQuestionCount(50, this)" class="q-count-btn bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-200">50</button>
                        <button onclick="selectQuestionCount(100, this)" class="q-count-btn bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-200">100</button>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-2" id="time-estimate">
                        <i class="fa-regular fa-clock mr-1"></i> Est. Time: 12 mins
                    </p>
                </div>
            </div>
            <div class="p-4 border-t border-slate-100">
                <button onclick="launchQuizFromModal()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2">
                    <span>Start Quiz</span> <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function selectQuestionCount(n, btn) {
    uiState.questionCount = n;
    
    // Reset all buttons
    document.querySelectorAll('.q-count-btn').forEach(b => {
        b.className = 'q-count-btn bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all';
    });
    
    // Activate clicked button (or first one if btn is null)
    if(btn) {
        btn.className = 'q-count-btn active bg-slate-900 text-white py-2 rounded-lg font-bold text-sm transition-all scale-105';
    }

    // Update time estimate
    const paperTag = document.getElementById('m-subject-tag');
    const paper = paperTag ? paperTag.innerText.toLowerCase() : 'gs1';
    
    // Use helper from core.js
    const mins = typeof estimateTime === 'function' ? estimateTime(n, paper) : Math.round(n * 1.5);
    
    const timeDisplay = document.getElementById('time-estimate');
    if(timeDisplay) {
        timeDisplay.innerHTML = `<i class="fa-regular fa-clock mr-1"></i> Est. Time: ${mins} mins`;
    }
}

function launchQuizFromModal() {
    if (!uiState.selectedSubject) {
        alert('Please select a subject');
        return;
    }
    
    // SAFETY CHECK: Ensure global variables exist
    const mode = window.currentMode || 'test';
    const paper = window.currentPaper || 'gs1';
    
    const config = buildQuizConfig({
        mode: mode,
        paper: paper,
        subject: uiState.selectedSubject.name,
        topic: uiState.selectedTopic,
        count: uiState.questionCount
    });
    
    saveQuizConfig(config);
    closeTopicModal();
    window.location.href = 'quiz_interface.html';
}

/**
 * General Modal Helpers
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    
    const bg = modal.querySelector('[id*="bg"]'); // generic selector for bg
    if (bg) bg.classList.remove('opacity-0');
    
    const content = modal.querySelector('[id*="content"]'); // generic selector for content
    if (content) content.classList.remove('translate-y-full');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const bg = modal.querySelector('[id*="bg"]');
    const content = modal.querySelector('[id*="content"]');
    
    if (bg) bg.classList.add('opacity-0');
    if (content) content.classList.add('translate-y-full');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

/**
 * Image Zoom Helper
 */
function openImageZoom(imageSrc) {
    let modal = document.getElementById('image-modal');
    // If it doesn't exist (e.g. on dashboard), create it dynamically
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.className = 'fixed inset-0 z-[2000] hidden bg-black/90 flex items-center justify-center p-4';
        modal.innerHTML = `
            <img id="zoom-img" src="" class="max-w-full max-h-full rounded shadow-2xl">
            <button class="absolute top-4 right-4 text-white text-2xl" onclick="this.parentElement.classList.add('hidden')">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        document.body.appendChild(modal);
    }
    
    const img = document.getElementById('zoom-img');
    if(img) img.src = imageSrc;
    modal.classList.remove('hidden');
}

