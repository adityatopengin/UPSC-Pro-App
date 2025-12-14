/**
 * page-settings.js
 * Settings page logic
 * Final Production Version
 */

document.addEventListener('DOMContentLoaded', () => {
    // Theme Init
    const isDark = localStorage.getItem('upsc_theme') === 'dark';
    const toggle = document.getElementById('dark-toggle');
    if (toggle) toggle.checked = isDark;
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');

    // Cloud Status
    if (typeof auth !== 'undefined' && auth.currentUser) {
        const statusEl = document.getElementById('sync-status');
        if (statusEl) {
            statusEl.innerHTML = '<i class="fa-solid fa-cloud text-blue-500"></i> Cloud Active';
            statusEl.classList.add('text-blue-600');
        }
    }
    
    // File Check (Mock)
    const fileCount = document.getElementById('file-count');
    if (fileCount) fileCount.innerText = "System Ready";
});

function goHome() {
    window.location.href = 'index.html';
}

async function triggerSync() {
    const btn = event.currentTarget;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Syncing...';
    btn.disabled = true;

    try {
        if (window.appData && window.appData.syncLocalToCloud) {
            await window.appData.syncLocalToCloud();
            
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Done';
            btn.classList.add('bg-emerald-500', 'text-white');
            btn.classList.remove('bg-blue-600');
            
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.classList.remove('bg-emerald-500');
                btn.classList.add('bg-blue-600');
                btn.disabled = false;
            }, 1000);
        } else {
            // Offline Mode Simulation
            setTimeout(() => {
                alert('Cloud sync unavailable (Offline Mode). Data is saved locally.');
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }, 500);
        }
    } catch (e) {
        alert('Sync failed: ' + e.message);
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

function logout() {
    if (typeof auth !== 'undefined' && auth.currentUser) {
        if (confirm('Log out of Cloud Account? Local data will remain.')) {
            auth.signOut().then(() => location.reload());
        }
    } else {
        alert('You are in Offline Mode. No account to log out from.');
    }
}

function toggleDark(el) {
    if (el.checked) {
        localStorage.setItem('upsc_theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        localStorage.setItem('upsc_theme', 'light');
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function setFont(size) {
    localStorage.setItem('upsc_font_size', size);
    alert(`Font Size set to: ${size.toUpperCase()}. Please reload.`);
}

function exportData() {
    const history = JSON.parse(localStorage.getItem('upsc_history') || '[]');
    const mistakes = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');

    const data = {
        exportDate: new Date().toISOString(),
        history: history,
        mistakes: mistakes
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upsc_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function clearHistory() {
    // FIXED: Used backticks for multi-line string
    const msg = `⚠ PERMANENTLY DELETE all quiz history and progress?
This cannot be undone.`;
    
    if (confirm(msg)) {
        localStorage.removeItem('upsc_history');
        localStorage.removeItem('upsc_mistakes');
        localStorage.removeItem('upsc_last_result');
        alert('History Cleared. Reloading...');
        window.location.href = 'index.html';
    }
}

function factoryReset() {
    // FIXED: Used backticks
    const msg = `⚠ FACTORY RESET

This will wipe ALL app data:
- Quiz History
- Saved Mistakes
- Settings

Are you sure?`;
    
    if (confirm(msg)) {
        localStorage.clear();
        alert('App Reset Complete. Reloading...');
        window.location.href = 'index.html';
    }
}

function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
}

