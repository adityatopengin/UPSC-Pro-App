/**
 * page-quiz.js
 * Quiz interface logic
 * Final Production Version
 */

let quizState = {
    quiz: [],
    currentIdx: 0,
    answers: {},
    bookmarks: [],
    eliminated: {},
    startTime: null,
    lastActiveTime: null,
    timerInterval: null,
    timeSpent: {},
    paused: false
};

let config = {
    mode: 'test',
    count: 5,
    timeLimit: 300
};

// Demo fallback
const demoQuestions = [
    {
        id: 101, type: 'standard', subject: 'Polity', year: 2018,
        text: "Which Article safeguards right to marry?",
        options: ["Article 19", "Article 21", "Article 25", "Article 29"],
        correct: 1, explanation: "Right to Marry is part of Article 21."
    }
];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const saved = loadQuizConfig();
        if (saved) config = saved;

        let loadedQuestions = [];
        
        // 1. Mistake Mode
        if (config.quickType === 'mistakes') {
            const quick = localStorage.getItem('upsc_quick_questions');
            if (quick) {
                loadedQuestions = JSON.parse(quick);
                localStorage.removeItem('upsc_quick_questions'); // Clear after load
            }
        } 
        // 2. Mock Test Mode (Placeholder: Load Polity for now)
        else if (config.subject === 'Mock Test') {
            // For now, load polity as a mock base. Later, load multiple files.
            loadedQuestions = await appData.fetchQuestions('polity.json');
        }
        // 3. Standard Mode
        else if (config.subject && config.subject !== 'Quick Practice') {
            const filename = getQuestionFilename(config.subject);
            loadedQuestions = await appData.fetchQuestions(filename);
        }
        // 4. Quick Practice (Random)
        else {
             // Default to Polity for quick practice if no specific subject
             loadedQuestions = await appData.fetchQuestions('polity.json');
        }

        // Fallback
        if (!loadedQuestions || loadedQuestions.length === 0) {
            console.warn('No questions found, using demo.');
            loadedQuestions = demoQuestions;
        }

        // Shuffle & Slice
        if (config.quickType !== 'mistakes') { // Don't shuffle mistakes order
            loadedQuestions.sort(() => Math.random() - 0.5);
        }
        quizState.quiz = loadedQuestions.slice(0, config.count || 10);

        // Start Quiz
        if (quizState.quiz.length > 0) {
            quizState.startTime = Date.now();
            quizState.lastActiveTime = Date.now();
            startTimer();
            loadQuestion(0);
            setupVisibilityListener();
            setupAutoSave();
        } else {
            alert('Error loading quiz data.');
            window.location.href = 'quiz_selection.html';
        }

    } catch (e) {
        console.error('Quiz Init Error:', e);
    }
});

function loadQuestion(idx) {
    if (!quizState.quiz[idx]) return;

    // Time Tracking
    const now = Date.now();
    if (quizState.lastActiveTime && quizState.quiz[quizState.currentIdx]) {
        const diff = Math.round((now - quizState.lastActiveTime) / 1000);
        const prevId = quizState.quiz[quizState.currentIdx].id;
        quizState.timeSpent[prevId] = (quizState.timeSpent[prevId] || 0) + diff;
    }
    quizState.lastActiveTime = now;
    quizState.currentIdx = idx;

    const q = quizState.quiz[idx];

    // Header Updates
    document.getElementById('header-subject').innerText = `${q.subject || 'GS'} • ${q.year || 'Model'}`;
    document.getElementById('q-num').innerText = `${idx + 1}/${quizState.quiz.length}`;
    document.getElementById('progress-bar').style.width = `${((idx + 1) / quizState.quiz.length) * 100}%`;

    // Render Question
    document.getElementById('q-text').innerText = q.text;
    
    // Image Handling
    const imgSlot = document.getElementById('img-slot');
    if(q.type === 'image' && q.imgUrl) {
        imgSlot.classList.remove('hidden');
        document.getElementById('q-image').src = q.imgUrl;
    } else {
        imgSlot.classList.add('hidden');
    }

    // Passage Handling
    const passageContainer = document.getElementById('passage-container');
    const questionContainer = document.getElementById('question-container');
    if(q.type === 'passage') {
        passageContainer.classList.remove('hidden');
        document.getElementById('passage-text').innerText = q.parentText || "";
        questionContainer.classList.add('h-3/5');
    } else {
        passageContainer.classList.add('hidden');
        questionContainer.classList.remove('h-3/5');
        questionContainer.classList.add('h-full');
    }

    // Render Options
    const optList = document.getElementById('options-list');
    optList.innerHTML = '';

    q.options.forEach((opt, i) => {
        const isSelected = quizState.answers[q.id] === i;
        const isEliminated = quizState.eliminated[q.id]?.includes(i);
        
        let statusClass = 'border-slate-200';
        // Learning Mode Feedback
        if (config.mode === 'learning' && quizState.answers[q.id] !== undefined) {
            if (i === q.correct) statusClass = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
            else if (isSelected) statusClass = 'bg-red-50 border-red-500 text-red-800 font-bold';
        } 
        // Test Mode Selection
        else if (isSelected) {
            statusClass = 'bg-blue-50 border-blue-600 border-2';
        }

        const eliminatedClass = isEliminated ? 'opacity-40 grayscale' : '';

        const div = document.createElement('div');
        div.className = `option-card card p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all active:scale-98 ${statusClass} ${eliminatedClass}`;
        
        div.onclick = () => {
            if (!isEliminated && quizState.answers[q.id] === undefined) { 
                // Only allow selection if not answered yet (or allow changing in test mode)
                if (config.mode === 'test' || quizState.answers[q.id] === undefined) {
                    selectOption(q.id, i);
                }
            } else if (config.mode === 'test' && !isEliminated) {
                // Allow changing answer in test mode
                selectOption(q.id, i);
            }
        };

        div.innerHTML = `
            <div class="w-6 h-6 rounded-full border-2 border-slate-300 flex-none flex items-center justify-center text-xs font-bold text-slate-400 mt-0.5">
                ${String.fromCharCode(65 + i)}
            </div>
            <p class="text-sm text-slate-700 leading-snug select-none flex-1 font-medium">${opt}</p>
            <button onclick="event.stopPropagation(); eliminateOption(event, ${q.id}, ${i})" 
                class="text-slate-300 hover:text-slate-500 p-2 z-10 transition-colors flex-none" title="Eliminate">
                <i class="fa-regular ${isEliminated ? 'fa-eye' : 'fa-eye-slash'}"></i>
            </button>
        `;
        optList.appendChild(div);
    });

    // Explanation (Learning Mode)
    const expBox = document.getElementById('explanation-box');
    if (config.mode === 'learning' && quizState.answers[q.id] !== undefined) {
        document.getElementById('exp-text').innerText = q.explanation || "No explanation available.";
        expBox.classList.remove('hidden');
        expBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        expBox.classList.add('hidden');
    }

    // Nav Buttons
    document.getElementById('btn-prev').disabled = idx === 0;
    const nextBtn = document.getElementById('btn-next');
    nextBtn.innerHTML = idx === quizState.quiz.length - 1 ? 
        'Finish <i class="fa-solid fa-flag-checkered ml-1"></i>' : 
        'Next <i class="fa-solid fa-arrow-right ml-1"></i>';

    // Bookmark Icon
    const bmBtn = document.getElementById('btn-bookmark');
    bmBtn.innerHTML = quizState.bookmarks.includes(q.id) ? 
        '<i class="fa-solid fa-star text-amber-400 text-xl"></i>' : 
        '<i class="fa-regular fa-star text-slate-300 text-xl"></i>';
}

function selectOption(qId, optIdx) {
    // Toggle check
    if (quizState.answers[qId] === optIdx) {
        delete quizState.answers[qId];
    } else {
        quizState.answers[qId] = optIdx;
    }
    loadQuestion(quizState.currentIdx);
}

function eliminateOption(e, qId, optIdx) {
    e.stopPropagation();
    if (!quizState.eliminated[qId]) quizState.eliminated[qId] = [];
    
    const idx = quizState.eliminated[qId].indexOf(optIdx);
    if (idx > -1) quizState.eliminated[qId].splice(idx, 1); // Un-eliminate
    else quizState.eliminated[qId].push(optIdx); // Eliminate
    
    loadQuestion(quizState.currentIdx);
}

function toggleBookmark() {
    const qId = quizState.quiz[quizState.currentIdx].id;
    const idx = quizState.bookmarks.indexOf(qId);
    if (idx > -1) quizState.bookmarks.splice(idx, 1);
    else quizState.bookmarks.push(qId);
    loadQuestion(quizState.currentIdx);
}

function nextQ() {
    if (quizState.currentIdx < quizState.quiz.length - 1) {
        loadQuestion(quizState.currentIdx + 1);
    } else {
        submitQuiz();
    }
}

function prevQ() {
    if (quizState.currentIdx > 0) loadQuestion(quizState.currentIdx - 1);
}

function startTimer() {
    const display = document.getElementById('timer-display');
    let elapsed = 0;
    
    quizState.timerInterval = setInterval(() => {
        if (quizState.paused) return;
        elapsed++;
        
        if (config.mode === 'test') {
            const remaining = (config.timeLimit || 300) - elapsed;
            if (remaining <= 0) {
                clearInterval(quizState.timerInterval);
                alert('Time is up!');
                submitQuiz();
                return;
            }
            display.innerText = formatTime(remaining);
            if(remaining < 60) display.classList.add('text-red-500');
        } else {
            display.innerText = formatTime(elapsed);
        }
    }, 1000);
}

function setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
        quizState.paused = document.hidden;
    });
}

function setupAutoSave() {
    setInterval(() => {
        localStorage.setItem('upsc_quiz_progress', JSON.stringify({
            answers: quizState.answers,
            currentIdx: quizState.currentIdx,
            timeSpent: quizState.timeSpent
        }));
    }, 10000);
}

function submitQuiz() {
    clearInterval(quizState.timerInterval);
    
    // Calculate final time for current question
    const now = Date.now();
    if (quizState.lastActiveTime && quizState.quiz[quizState.currentIdx]) {
        const diff = Math.round((now - quizState.lastActiveTime) / 1000);
        const qId = quizState.quiz[quizState.currentIdx].id;
        quizState.timeSpent[qId] = (quizState.timeSpent[qId] || 0) + diff;
    }

    const scoreData = calculateScore(quizState.quiz, quizState.answers);
    
    if (confirm(`Submit Quiz?\n\nAttempted: ${scoreData.attempted}/${quizState.quiz.length}\nSkipped: ${scoreData.skipped}`)) {
        
        // Identify Mistakes
        const mistakes = quizState.quiz.filter(q => 
            quizState.answers[q.id] !== undefined && quizState.answers[q.id] !== q.correct
        );
        saveMistakes(mistakes);

        // Save Result
        const totalTime = Object.values(quizState.timeSpent).reduce((a,b)=>a+b, 0);
        const resultData = {
            score: scoreData.score,
            total: quizState.quiz.length,
            correct: scoreData.correct,
            wrong: scoreData.wrong,
            skipped: scoreData.skipped,
            subject: config.subject,
            topic: config.topic,
            mode: config.mode,
            paper: config.paper,
            accuracy: scoreData.attemptedAccuracy,
            timeSpent: totalTime,
            quiz: quizState.quiz.map(q => ({
                ...q,
                userSel: quizState.answers[q.id]
            })),
            timestamp: new Date().toISOString()
        };

        appData.saveResult(resultData);
        localStorage.setItem('upsc_last_result', JSON.stringify(resultData));
        localStorage.removeItem('upsc_quiz_progress');
        
        window.location.href = 'analysis.html';
    } else {
        startTimer(); // Resume if cancelled
    }
}

function exitQuiz() {
    if (confirm("Exit? Progress will be lost.")) {
        clearInterval(quizState.timerInterval);
        window.location.href = 'quiz_selection.html';
    }
}

// Map Modal Logic
function toggleMap() {
    const modal = document.getElementById('map-modal');
    const grid = document.getElementById('map-grid');
    
    if (modal.classList.contains('hidden')) {
        grid.innerHTML = '';
        quizState.quiz.forEach((q, i) => {
            let color = 'bg-slate-100 text-slate-500';
            if (i === quizState.currentIdx) color = 'bg-blue-600 text-white';
            else if (quizState.answers[q.id] !== undefined) color = 'bg-slate-800 text-white';
            else if (quizState.bookmarks.includes(q.id)) color = 'bg-amber-100 text-amber-600';
            
            const btn = document.createElement('button');
            btn.className = `w-10 h-10 rounded-lg text-sm font-bold ${color}`;
            btn.innerText = i + 1;
            btn.onclick = () => {
                loadQuestion(i);
                toggleMap();
            };
            grid.appendChild(btn);
        });
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

