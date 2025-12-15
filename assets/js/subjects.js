/**
 * subjects.js
 * Single source of truth for all UPSC subjects, topics, and file mappings
 * Updated to support the full 15-file structure.
 */

// 1. GS PAPER 1 (12 Subjects)
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
        topics: ['All Topics', 'Indus Valley', 'Vedic Age', 'Mauryan Empire']
    },
    {
        id: 'history_med',
        name: 'Medieval India',
        icon: 'fa-chess-rook',
        color: 'amber',
        topics: ['All Topics', 'Delhi Sultanate', 'Mughal Empire', 'Vijayanagara']
    },
    {
        id: 'art_culture',
        name: 'Art & Culture',
        icon: 'fa-palette',
        color: 'rose',
        topics: ['All Topics', 'Architecture', 'Painting', 'Dance & Music']
    },
    {
        id: 'geo_world',
        name: 'World Geography',
        icon: 'fa-earth-americas',
        color: 'blue',
        topics: ['All Topics', 'Geomorphology', 'Climatology', 'Oceanography']
    },
    {
        id: 'geo_india',
        name: 'Indian Geography',
        icon: 'fa-map-location-dot',
        color: 'cyan',
        topics: ['All Topics', 'Physiography', 'Drainage System', 'Monsoon']
    },
    {
        id: 'env',
        name: 'Environment',
        icon: 'fa-leaf',
        color: 'green',
        topics: ['All Topics', 'Ecology', 'Biodiversity', 'Climate Change']
    },
    {
        id: 'econ',
        name: 'Indian Economy',
        icon: 'fa-indian-rupee-sign',
        color: 'emerald',
        topics: ['All Topics', 'Banking', 'Budget', 'Agriculture']
    },
    {
        id: 'sci',
        name: 'Science & Tech',
        icon: 'fa-microchip',
        color: 'purple',
        topics: ['All Topics', 'Space', 'Biotech', 'IT & Telecom']
    },
    {
        id: 'ir',
        name: 'Intl. Relations',
        icon: 'fa-handshake',
        color: 'indigo',
        topics: ['All Topics', 'India & Neighbors', 'Institutions (UN, WTO)', 'Treaties']
    },
    {
        id: 'misc',
        name: 'Miscellaneous',
        icon: 'fa-star',
        color: 'slate',
        topics: ['All Topics', 'Govt Schemes', 'Awards', 'Sports']
    }
];

// 2. CSAT PAPER 2 (3 Subjects)
const subjectsCSAT = [
    {
        id: 'math',
        name: 'Mathematics',
        icon: 'fa-calculator',
        color: 'red',
        topics: ['All Topics', 'Number System', 'Percentage', 'Time & Work']
    },
    {
        id: 'reasoning',
        name: 'Reasoning',
        icon: 'fa-brain',
        color: 'violet',
        topics: ['All Topics', 'Coding-Decoding', 'Blood Relations', 'Syllogism']
    },
    {
        id: 'passage',
        name: 'Passages',
        icon: 'fa-book-open',
        color: 'teal',
        topics: ['All Topics', 'Inference', 'Assumption', 'Main Idea']
    }
];

/**
 * Filename mapping: subject.name → JSON filename
 * EXACTLY matching your requirement list
 */
const filenameMap = {
    'Indian Polity': 'polity',
    'Modern India': 'modern_history',
    'Ancient India': 'ancient_history',
    'Medieval India': 'medieval_history',
    'Art & Culture': 'art_culture',
    'World Geography': 'world_geo',
    'Indian Geography': 'indian_geo',
    'Environment': 'environment',
    'Indian Economy': 'economy',
    'Science & Tech': 'science_tech',
    'Intl. Relations': 'ir',
    'Miscellaneous': 'misc',
    'Mathematics': 'csat_math',
    'Reasoning': 'csat_reasoning',
    'Passages': 'csat_passage'
};

function getQuestionFilename(subjectName) {
    // If filename is found, append .json, otherwise use demo.json
    return (filenameMap[subjectName] || 'demo') + '.json';
}

function getSubjectByName(subjectName, paper = 'gs1') {
    const list = paper === 'gs1' ? subjectsGS1 : subjectsCSAT;
    return list.find(s => s.name === subjectName);
}
