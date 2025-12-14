/**
 * page-stats.js
 * Stats page logic - lifetime analytics
 * Final Production Version
 */

let statsState = {
    stats: null
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.appData) {
            statsState.stats = await appData.getStats();
            renderOverallStats();
            renderCharts();
            renderSubjectList();
        }
    } catch (e) {
        console.error('Stats init failed:', e);
    }
});

function renderOverallStats() {
    if (!statsState.stats) return;
    const stats = statsState.stats;

    document.getElementById('total-qs').innerText = stats.totalQuestions.toLocaleString();
    document.getElementById('total-accuracy').innerText = stats.accuracy + '%';

    // Format Hours/Mins
    const h = Math.floor(stats.studyHours / 60);
    const m = stats.studyHours % 60;
    document.getElementById('study-hours').innerText = `${h}h ${m}m`;

    // SWOT Buckets
    let strong = [], mod = [], weak = [];
    if (stats.subjects) {
        for (const [sub, data] of Object.entries(stats.subjects)) {
            if (data.acc > 65) strong.push(sub);
            else if (data.acc >= 40) mod.push(sub);
            else weak.push(sub);
        }
    }

    document.getElementById('list-strength').innerText = strong.length ? strong.join(', ') : 'None yet';
    document.getElementById('list-moderate').innerText = mod.length ? mod.join(', ') : 'None yet';
    document.getElementById('list-weak').innerText = weak.length ? weak.join(', ') : 'None yet';
}

function renderCharts() {
    if (!statsState.stats) return;
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    const historyData = (statsState.stats.history && statsState.stats.history.length) 
        ? statsState.stats.history 
        : [0];

    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: historyData.map((_, i) => `T${i + 1}`),
            datasets: [{
                label: 'Accuracy %',
                data: historyData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { borderDash: [4, 4] }, ticks: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderSubjectList() {
    const container = document.getElementById('subject-list');
    if (!container || !statsState.stats) return;
    
    container.innerHTML = '';
    const subjects = statsState.stats.subjects || {};

    if (Object.keys(subjects).length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-slate-400 text-sm">Take a quiz to see data here.</div>';
        return;
    }

    Object.entries(subjects)
        .sort((a, b) => b[1].acc - a[1].acc)
        .forEach(([name, data]) => {
            let color = data.acc > 65 ? 'text-emerald-600' : (data.acc >= 40 ? 'text-amber-600' : 'text-red-500');
            let barBg = data.acc > 65 ? 'bg-emerald-500' : (data.acc >= 40 ? 'bg-amber-500' : 'bg-red-500');

            const card = document.createElement('div');
            card.className = 'bg-white rounded-xl border border-slate-200 overflow-hidden mb-2';
            card.innerHTML = `
                <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onclick="toggleSubject(this)">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs">
                            ${name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-slate-800">${name}</h4>
                            <p class="text-[10px] text-slate-400">${data.qs} Qs Attempted</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-sm font-bold ${color}">${data.acc}%</span>
                        <i class="fa-solid fa-chevron-down text-slate-300 text-xs transition-transform duration-300 chevron"></i>
                    </div>
                </div>
                <div class="expand-content max-h-0 overflow-hidden transition-all duration-300">
                    <div class="p-4 bg-slate-50 border-t border-slate-100">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-bold text-slate-600">Accuracy Progress</span>
                            <span class="text-xs font-bold text-slate-600">${data.correct}/${data.qs} Correct</span>
                        </div>
                        <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div class="${barBg}" style="width: ${data.acc}%; height: 100%;"></div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
}

function toggleSubject(element) {
    const content = element.nextElementSibling;
    const chevron = element.querySelector('.chevron');

    // Close others
    document.querySelectorAll('.expand-content').forEach(el => {
        if (el !== content) el.style.maxHeight = '0px';
    });
    document.querySelectorAll('.chevron').forEach(el => {
        if (el !== chevron) el.style.transform = 'rotate(0deg)';
    });

    // Toggle current
    if (content.style.maxHeight && content.style.maxHeight !== '0px') {
        content.style.maxHeight = '0px';
        chevron.style.transform = 'rotate(0deg)';
    } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        chevron.style.transform = 'rotate(180deg)';
    }
}

