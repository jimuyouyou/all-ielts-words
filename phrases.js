const fs = require('fs').promises;
const path = require('path');

const dataPath = './data/';

const excludeWords = new Set([
    // Articles
    'a', 'an', 'the',

    // Be verbs
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',

    // Conjunctions
    'and', 'or', 'but', 'so', 'yet', 'for', 'nor', 'not',

    // Question words
    'if', 'then', 'else', 'when', 'where', 'why', 'how',

    // Pronouns
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their',
    'this', 'that', 'these', 'those',
    'what', 'which', 'who', 'whom', 'whose', 'whoever', 'whomever', 'whatever',
    'whenever', 'wherever', 'however', 'whyever', 'whichever',

    // Prepositions and compounds
    'in', 'on', 'at', 'to', 'from', 'by', 'of', 'with',
    'into', 'onto', 'upon', 'out', 'off', 'over', 'under',
    'below', 'beneath', 'above', 'atop', 'among', 'between',
    'before', 'after', 'behind', 'beside', 'besides', 'along',
    'around', 'through', 'toward', 'towards', 'within', 'without',
    'against', 'amongst', 'amid', 'amidst', 'apart', 'aside',
    'about', 'more', 'as', 'will', 'would', 'should', 'shall',
    'can', 'could', 'may', 'might', 'must', 'ought', 'dare', 'than', 'there',

    // Numbers
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',

    // Punctuation
    '.', ',', ';', ':', '!', '?', '"', "'", '`',
    '(', ')', '[', ']', '{', '}', '-', '_', '/',
    '@', '#', '$', '%', '^', '&', '*', '+', '=', '\\',

    // Common phrases
    'according to', 'ahead of', 'apart from', 'as for',
    'because of', 'due to', 'except for', 'instead of',
    'next to', 'out of', 'rather than', 'such as',
    'up to', 'as well as', 'in front of', 'in spite of'
]);

// console.log(excludeWords);

const getPhrases = async (passage) => {
    // Split the passage into lines using newlines and punctuation marks, then clean up
    const lines = passage.toLowerCase().trim().split(/[\n.?!]+/).map(line => line.trim()).filter(Boolean);

    // Process each line to find all possible multi-word phrases
    const phrases = {};
    lines.forEach(line => {
        // Split line into words and remove empty strings
        const words = line.split(/\s+/).filter(Boolean);
        // Generate all possible phrases of 2 or more words
        for (let i = 0; i < words.length - 1; i++) {
            // Skip if the first word is in excludeWords or starts with punctuation/number
            if (excludeWords.has(words[i]) || /^[\d\W]/.test(words[i])) continue;

            for (let j = i + 1; j < words.length; j++) {
                // Skip if the last word is in excludeWords or ends with punctuation/number
                if (excludeWords.has(words[j]) || /[\d\W]$/.test(words[j])) continue;

                const phrase = words.slice(i, j + 1).join(' ');
                phrases[phrase] = (phrases[phrase] || 0) + 1;
            }
        }
    });

    // Filter phrases based on word count and frequency requirements
    return Object.entries(phrases)
        .filter(([phrase, count]) => {
            const wordCount = phrase.split(' ').length;
            return (wordCount === 2 && count >= 3) ||
                (wordCount >= 3 && count >= 2);
        })
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((acc, [phrase, count]) => {
            acc[phrase] = count;
            return acc;
        }, {});
};

const getAllFiles = async (dirPath) => {
    const files = await fs.readdir(dirPath);
    const allFiles = await Promise.all(
        files.map(async file => {
            const filePath = path.join(dirPath, file);
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                return getAllFiles(filePath);
            } else if (file.endsWith('.txt')) {
                return filePath;
            }
            return [];
        })
    );
    return allFiles.flat();
};

const test = async () => {
    // Get all .txt files recursively
    const files = await getAllFiles(dataPath);
    const passages = await Promise.all(
        files.map(file => fs.readFile(file, 'utf-8'))
    );
    // Join all passages with newlines
    const combinedPassages = passages.join('\n\n');
    const phrases = await getPhrases(combinedPassages);
    console.log(phrases);
    console.log('Total phrases:', Object.keys(phrases).length);
    console.log('Total files processed:', files.length);
}
test();