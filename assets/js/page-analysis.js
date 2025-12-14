/**
 * page-analysis.js
 * Analysis page logic
 * Final Production Version
 */

let analysisData = {
    score: 0,
    total: 0,
    correct: 0,
    wrong: 0,
    skipped: 0,
    accuracy: 0,
    quiz: [],
    timeSpent: {}
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const saved = localStorage.getItem('upsc_last_result');
        
        if (saved) {
            analysisData = JSON.parse(saved);
        } else {
            console.warn('No recent quiz found, generating mock data for preview.');
            analysisData = generateMockAnalysis();
        }

        initAnalysis();
        saveMistakesAutomatically();
    } catch (e) {
        console.error('Analysis init failed:', e);
    }
});

function generateMockAnalysis() {
    return {
        score: 4.66, total: 5, correct: 2, wrong: 2, skipped: 1, accuracy: 50,
        quiz: [
            { id: 101, subject: 'Polity', text: "Which Article safeguards right to marry?", options: ["Art 19", "Art 21", "Art 25", "Art 29"], correct: 1, explanation: "SC ruled Right to Marry is part of Article 21.", userSel: 1 },
            { id: 102, subject: 'Economy', text: "WTI is associated with:", options: ["Crude Oil", "Bullion", "Rare Earth", "Uranium"], correct: 0, explanation: "WTI is a crude oil benchmark.", userSel: 2 }
        ],
        timeSpent: { 101: 45, 102: 60 }
    };
}

function initAnalysis() {
    // Populate Scorecard
    document.getElementById('final-score').innerText = analysisData.score || 0;
    document.getElementById('total-marks').innerText = (analysisData.total * 2) || 10;
    
    // Time Formatting using core.js helper if available
    const totalSeconds = typeof analysisData.timeSpent === 'number' ? analysisData.timeSpent : Object.values(analysisData.timeSpent || {}).reduce((a,b)=>a+b, 0);
    const timeStr = typeof formatDuration === 'function' ? formatDuration(totalSeconds) : `${Math.floor(totalSeconds/60)}m`;
    
    document.getElementById('total-time-taken').innerText = timeStr;
    document.getElementById('accuracy-text').innerText = (analysisData.accuracy || 0) + '%';
    
    // Average Time
    const avg = analysisData.total > 0 ? Math.round(totalSeconds / analysisData.total) : 0;
    document.getElementById('avg-time').innerText = avg + 's';

    // Counts
    document.getElementById('count-correct').innerText = analysisData.correct;
    document.getElementById('count-wrong').innerText = analysisData.wrong;
    document.getElementById('count-skipped').innerText = analysisData.skipped;
    document.getElementById('center-total').innerText = analysisData.total;

    // Render Visuals
    renderAccuracyChart(analysisData.correct, analysisData.wrong, analysisData.skipped);
    renderSubjectChart();
    renderReviewList('all');
}

function renderAccuracyChart(c, w, s) {
    const ctx = document.getElementById('accuracyChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Correct', 'Wrong', 'Skipped'],
            datasets: [{
                data: [c, w, s],
                backgroundColor: ['#10b981', '#ef4444', '#cbd5e1'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: '70%',
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderSubjectChart() {
    const ctx = document.getElementById('subjectChart');
    if (!ctx) return;

    const subjectStats = {};
    analysisData.quiz.forEach(q => {
        const sub = q.subject || 'Gen';
        if (!subjectStats[sub]) subjectStats[sub] = { total: 0, correct: 0 };
        subjectStats[sub].total++;
        if (q.userSel === q.correct) subjectStats[sub].correct++;
    });

    const labels = Object.keys(subjectStats);
    const data = labels.map(s => Math.round((subjectStats[s].correct / subjectStats[s].total) * 100));

    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score %',
                data: data,
                backgroundColor: '#3b82f6',
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { display: false }, ticks: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderReviewList(filter) {
    const container = document.getElementById('review-list');
    container.innerHTML = '';
    
    // Update Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.innerText.toLowerCase() === filter) {
            btn.className = 'filter-btn active px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white transition-colors';
        } else {
            btn.className = 'filter-btn px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors';
        }
    });

    const questions = analysisData.quiz.filter(q => {
        if (filter === 'wrong') return q.userSel !== undefined && q.userSel !== q.correct;
        return true;
    });

    questions.forEach((q, i) => {
        let status = 'Skipped';
        let colorClass = 'bg-slate-50 border-slate-200 text-slate-500';
        
        if (q.userSel === q.correct) {
            status = 'Correct';
            colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-700';
        } else if (q.userSel !== undefined) {
            status = 'Wrong';
            colorClass = 'bg-red-50 border-red-200 text-red-700';
        }

        const div = document.createElement('div');
        div.className = 'card p-4 rounded-xl border bg-white cursor-pointer hover:shadow-md transition-all active:scale-95';
        div.onclick = () => openQuestionModal(q);
        
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colorClass}">${status}</span>
                    <span class="text-xs font-bold text-slate-400 uppercase">${q.subject || 'GS'}</span>
                </div>
            </div>
            <p class="text-sm font-medium text-slate-800 line-clamp-2">${q.text}</p>
        `;
        container.appendChild(div);
    });
}

function filterReview(type) {
    renderReviewList(type);
}

function openQuestionModal(q) {
    // Populate Modal
    document.getElementById('m-subject').innerText = q.subject || 'GS';
    document.getElementById('m-text').innerText = q.text;
    document.getElementById('m-exp').innerText = q.explanation || "No explanation provided.";

    const imgBox = document.getElementById('m-img-container');
    if (q.imgUrl) {
        imgBox.classList.remove('hidden');
        document.getElementById('m-image').src = q.imgUrl;
    } else {
        imgBox.classList.add('hidden');
    }

    const optContainer = document.getElementById('m-options');
    optContainer.innerHTML = '';

    q.options.forEach((opt, i) => {
        let style = 'p-3 rounded-lg border-2 border-slate-100 text-slate-600';
        let icon = '';

        if (i === q.correct) {
            style = 'p-3 rounded-lg border-2 border-emerald-200 bg-emerald-50 text-emerald-800 font-bold';
            icon = '<i class="fa-solid fa-check float-right mt-1"></i>';
        } else if (i === q.userSel) {
            style = 'p-3 rounded-lg border-2 border-red-200 bg-red-50 text-red-800 font-bold';
            icon = '<i class="fa-solid fa-xmark float-right mt-1"></i>';
        }

        const div = document.createElement('div');
        div.className = `${style} text-sm mb-2`;
        div.innerHTML = `${opt} ${icon}`;
        optContainer.appendChild(div);
    });

    // Use ui-common helper
    openModal('q-modal');
}

function saveMistakesAutomatically() {
    const mistakes = analysisData.quiz.filter(q => q.userSel !== undefined && q.userSel !== q.correct);
    if (mistakes.length > 0) {
        saveMistakes(mistakes); // core.js helper
    } else {
        const alert = document.getElementById('mistake-alert');
        if(alert) alert.classList.add('hidden');
    }
}

function exportReport() {
    window.print();
}

function goHome() {
    window.location.href = 'index.html';
}

