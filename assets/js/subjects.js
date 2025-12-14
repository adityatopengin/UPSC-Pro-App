/**
 * subjects.js
 * Single source of truth for all UPSC subjects, topics, and file mappings
 */

const subjectsGS1 = [
    {
        id: 'polity',
        name: 'Indian Polity',
        icon: 'fa-landmark',
        color: 'orange',
        topics: ['All Topics', 'Preamble', 'Fundamental Rights', 'Parliament', 'Judiciary']
    },
    {
        id: 'history_mod',
        name: 'Modern India',
        icon: 'fa-feather-pointed',
        color: 'yellow',
        topics: ['All Topics', '1857 Revolt', 'Gandhian Era', 'Freedom Struggle']
    },
    {
        id: 'history_anc',
        name: 'Ancient India',
        icon: 'fa-scroll',
        color: 'amber',
        topics: ['All Topics', 'Indus Valley', 'Vedic Age', 'Mauryan']
    },
    {
        id: 'geo_world',
        name: 'World Geo',
        icon: 'fa-earth-americas',
        color: 'blue',
        topics: ['All Topics', 'Geomorphology', 'Climatology']
    },
    {
        id: 'econ',
        name: 'Indian Economy',
        icon: 'fa-indian-rupee-sign',
        color: 'green',
        topics: ['All Topics', 'Banking', 'Budget', 'Agriculture']
    },
    {
        id: 'sci',
        name: 'Science & Tech',
        icon: 'fa-microchip',
        color: 'purple',
        topics: ['All Topics', 'Space', 'Biotech', 'IT & Telecom']
    }
];

const subjectsCSAT = [
    {
        id: 'math',
        name: 'Maths',
        icon: 'fa-calculator',
        color: 'indigo',
        topics: ['All Topics', 'Number System', 'Percentage', 'Time & Work']
    },
    {
        id: 'reasoning',
        name: 'Reasoning',
        icon: 'fa-brain',
        color: 'indigo',
        topics: ['All Topics', 'Coding-Decoding', 'Blood Relations']
    },
    {
        id: 'passage',
        name: 'Passages',
        icon: 'fa-book-open',
        color: 'indigo',
        topics: ['All Topics', 'Inference', 'Assumption']
    }
];

/**
 * Filename mapping: subject.name → JSON filename
 */
const filenameMap = {
    'Indian Polity': 'polity',
    'Modern India': 'modern_history', // Matches your history.json rename
    'Ancient India': 'ancient_history',
    'World Geo': 'world_geo',
    'Indian Economy': 'economy',
    'Science & Tech': 'science_tech',
    'Maths': 'csat_math',
    'Reasoning': 'csat_reasoning',
    'Passages': 'csat_passage'
};

function getQuestionFilename(subjectName) {
    return (filenameMap[subjectName] || 'demo') + '.json';
}

function getSubjectByName(subjectName, paper = 'gs1') {
    const list = paper === 'gs1' ? subjectsGS1 : subjectsCSAT;
    return list.find(s => s.name === subjectName);
}
