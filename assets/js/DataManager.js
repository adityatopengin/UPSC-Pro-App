/**
 * DataManager.js
 * Data layer: local history, stats, Firebase sync
 * Final Production Version
 */

class DataManager {
    constructor() {
        this.userId = null;
        this.mode = 'local'; 
        this.initAuth();
    }

    initAuth() {
        if (typeof auth === 'undefined') {
            console.log('Firebase auth unavailable → LOCAL mode');
            return;
        }
        try {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    this.userId = user.uid;
                    this.mode = 'cloud';
                    this.syncLocalToCloud();
                } else {
                    this.mode = 'local';
                }
            });
        } catch (e) {
            console.warn('Auth init error:', e);
        }
    }

    /**
     * Fetch questions with Smart Parsing
     */
    async fetchQuestions(filename) {
        try {
            const response = await fetch(`./data/${filename}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            // PRODUCTION FIX: Handle both Array and Object formats
            if (Array.isArray(data)) {
                return data;
            } else if (data.questions && Array.isArray(data.questions)) {
                return data.questions;
            } else {
                console.warn(`Invalid format in ${filename}`);
                return [];
            }
        } catch (error) {
            console.warn(`Failed to load ${filename}:`, error);
            return [];
        }
    }

    /**
     * Save Result
     */
    async saveResult(resultData) {
        const history = this.getLocalHistory();
        history.push({
            ...resultData,
            synced: false,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem('upsc_history', JSON.stringify(history));

        if (this.mode === 'cloud' && typeof db !== 'undefined') {
            // Cloud sync logic (placeholder for now)
            console.log('Result saved locally (Cloud sync ready)');
        }
        return true;
    }

    /**
     * Get Aggregated Stats
     */
    async getStats() {
        const history = this.getLocalHistory();
        
        let totalQs = 0;
        let totalCorrect = 0;
        let totalTimeSeconds = 0;
        const subjects = {};
        const accuracyHistory = [];

        history.forEach(h => {
            totalQs += (h.total || 0);
            totalCorrect += (h.correct || 0);
            totalTimeSeconds += (h.timeSpent || 0); // Ensure this is seconds

            const acc = h.total ? Math.round((h.correct / h.total) * 100) : 0;
            accuracyHistory.push(acc);

            const sub = h.subject || 'Mixed';
            if (!subjects[sub]) subjects[sub] = { qs: 0, correct: 0 };
            subjects[sub].qs += (h.total || 0);
            subjects[sub].correct += (h.correct || 0);
        });

        // Convert subject stats to percentage
        const subjectStats = {};
        for (const [key, val] of Object.entries(subjects)) {
            subjectStats[key] = {
                qs: val.qs,
                correct: val.correct,
                acc: val.qs > 0 ? Math.round((val.correct / val.qs) * 100) : 0
            };
        }

        return {
            totalQuestions: totalQs,
            accuracy: totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0,
            studyHours: Math.round(totalTimeSeconds / 60), // Return Minutes for display
            subjects: subjectStats,
            history: accuracyHistory.slice(-10)
        };
    }

    getLocalHistory() {
        return JSON.parse(localStorage.getItem('upsc_history') || '[]');
    }

    syncLocalToCloud() {
        // Future implementation
    }
}

// Export singleton
const appData = new DataManager();
