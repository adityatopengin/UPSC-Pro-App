/**
 * core.js
 * Shared logic: Theme, scoring, time, config, Mistake Bank helpers
 * Final Production Version
 */

/* =========================================
   1. THEME LOADER (Must run first)
   ========================================= */
(function initTheme() {
    const savedTheme = localStorage.getItem('upsc_theme');
    
    // Check local storage OR system preference
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

/* =========================================
   2. QUIZ LOGIC
   ========================================= */

/**
 * Calculate quiz score with negative marking
 */
function calculateScore(quiz, answers, marksPerCorrect = 2, negativeMark = 0.66) {
    let correct = 0, wrong = 0, skipped = 0;
    
    quiz.forEach(q => {
        const userAnswer = answers[q.id];
        if (userAnswer === undefined) {
            skipped++;
        } else if (userAnswer === q.correct) {
            correct++;
        } else {
            wrong++;
        }
    });
    
    // Allow negative scores
    const rawScore = correct * marksPerCorrect - wrong * negativeMark;
    const score = parseFloat(rawScore.toFixed(2));
    
    const attempted = correct + wrong;
    const attemptedAccuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    
    return {
        correct, wrong, skipped, attempted, score, attemptedAccuracy
    };
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

/**
 * Format seconds to readable string (e.g. "1h 5m")
 */
function formatDuration(seconds) {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Build and Save Quiz Config
 */
function buildQuizConfig(config) {
    const baseConfig = {
        mode: config.mode || 'test',
        paper: config.paper || 'gs1',
        subject: config.subject || 'Mixed',
        topic: config.topic || 'All Topics',
        count: config.count || 10,
        timestamp: new Date().toISOString()
    };
    
    // Time Limit Logic: 1.2 min (GS) vs 1.5 min (CSAT)
    if (config.paper === 'gs1') {
        baseConfig.timeLimit = config.count * 72; 
    } else {
        baseConfig.timeLimit = config.count * 90; 
    }
    
    return baseConfig;
}

function saveQuizConfig(config) {
    localStorage.setItem('upsc_quiz_config', JSON.stringify(config));
}

function loadQuizConfig() {
    const saved = localStorage.getItem('upsc_quiz_config');
    return saved ? JSON.parse(saved) : null;
}

/**
 * Mistake Bank Logic
 */
function saveMistakes(mistakes) {
    if (!mistakes || mistakes.length === 0) return;
    
    let savedMistakes = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
    
    mistakes.forEach(m => {
        // Avoid duplicates
        if (!savedMistakes.find(sm => sm.id === m.id)) {
            savedMistakes.push({
                id: m.id,
                subject: m.subject,
                text: m.text,
                options: m.options,
                correct: m.correct,
                userAnswer: m.userSel,
                explanation: m.explanation,
                savedAt: new Date().toISOString()
            });
        }
    });
    
    // Cap at 100 mistakes to prevent storage overflow
    if (savedMistakes.length > 100) {
        savedMistakes = savedMistakes.slice(-100);
    }
    
    localStorage.setItem('upsc_mistakes', JSON.stringify(savedMistakes));
}

function getMistakeQuestions(count = 10) {
    const mistakes = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
    // Return latest mistakes first
    return mistakes.reverse().slice(0, count);
}

function estimateTime(questionCount, paper = 'gs1') {
    const secondsPerQ = paper === 'gs1' ? 72 : 90;
    return Math.round((questionCount * secondsPerQ) / 60);
}
