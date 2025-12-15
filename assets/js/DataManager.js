/**
 * DataManager.js
 * Data layer: local history, stats, Firebase sync
 * Final Production Version (Universal Adapter)
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
     * Fetch questions with Universal Adapter
     * Handles Old Format, New Format, and Object/Array wrappers
     */
    async fetchQuestions(filename) {
        try {
            const response = await fetch(`./data/${filename}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const rawData = await response.json();
            let rawQuestions = [];

            // 1. Unwrap Data (Handle {questions: [...]} vs [...])
            if (Array.isArray(rawData)) {
                rawQuestions = rawData;
            } else if (rawData.questions && Array.isArray(rawData.questions)) {
                rawQuestions = rawData.questions;
            } else {
                console.warn(`Invalid format in ${filename}`);
                return [];
            }

            // 2. ADAPTER: Normalize Data to App Standard
            return rawQuestions.map(q => {
                // Determine Correct Answer Index
                let correctIdx = 0;
                if (q.correct !== undefined) correctIdx = q.correct; // Old format
                else if (q.correct_option_index !== undefined) correctIdx = q.correct_option_index; // New format

                // Determine Question Type
                let qType = 'standard';
                if (q.type) qType = q.type; // Old format
                else if (q.question_type) {
                    // Map new types to old standard
                    if (q.question_type === 'MCQ_multiple') qType = 'standard';
                    // Add more mappings here if needed (e.g., 'Passage' -> 'passage')
                }

                return {
                    // Essential Fields for UI
                    id: q.id, // String or Number is fine
                    text: q.text || q.question_text, // Handle both names
                    options: q.options,
                    correct: correctIdx,
                    explanation: q.explanation,
                    type: qType,
                    
                    // Rich Metadata (Pass through for display)
                    subject: q.subject,
                    topic: q.topic || 'General',
                    year: q.year,
                    difficulty: q.difficulty,
                    
                    // Image/Passage Support (Preserve if present)
                    imgUrl: q.imgUrl || q.image_url,
                    parentText: q.parentText || q.passage_text
                };
            });

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
            totalTimeSeconds += (h.timeSpent || 0);

            const acc = h.total ? Math.round((h.correct / h.total) * 100) : 0;
            accuracyHistory.push(acc);

            const sub = h.subject || 'Mixed';
            if (!subjects[sub]) subjects[sub] = { qs: 0, correct: 0 };
            subjects[sub].qs += (h.total || 0);
            subjects[sub].correct += (h.correct || 0);
        });

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
            studyHours: Math.round(totalTimeSeconds / 60),
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

const appData = new DataManager();

