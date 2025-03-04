const fs = require('fs').promises;
const path = require('path');
const phrases = require('./src/phrases.json');
// console.log(phrases);

const listeningPath = './data/listening';
const readingPath = './data/reading';
const listeningPathA = './data/alistening';
const readingPathA = './data/areading';

function processGroup(freqGroup, content) {
  const arr = [];

  const sentences = content.replace(/(?:\r\n|\r|\n)/g, ' ').split(/[\:!\.\?\)\(;\-–&\,“”\d]/);
  sentences.forEach(sent => {
    for (let i = 0; i < 10; i++) arr[i] = [];
    const words = sent.split(/\s+/);
    words.forEach(word => {
      for (let i = 0; i < 10; i++) {
        const wd = word.trim();
        if (wd.length > 0) arr[i].push(wd);
        if (arr[i].length > i + 2) {
          arr[i].shift();
          const key = arr[i].join(' ');
          // console.log('key', arr[i]);
          freqGroup[key] = (freqGroup[key] || 0) + 1;
        }
      }
    });
  });
}

const A2J = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const A2JS = ['A ', 'B ', 'C ', 'D ', 'E ', 'F ', 'G ', 'H ', 'I ', 'J ', 'K ', 'L ', 'M ', 'N ',
  'A)', 'B)', 'C)', 'D)', 'E)', 'F)', 'G)', 'H)', 'I)', 'J)', 'K)', 'L)', 'M)', 'N)',
  'A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'I.', 'J.', 'K.', 'L.', 'M.', 'N.',
];
const getParagraphs = (content) => {
  const ps = content.split(/(?:\r\n|\r|\n)/g).filter(s => s.trim().length > 2);

  ps.forEach((p, i) => {
    let p1 = p.replace(/(?:\r\n|\r|\n)/g, ' ').trim();
    if (p1.length < 50 && i == 0) p1 = '<h2>' + p1 + '</h2>';
    else if (A2J.includes(p1)) p1 = '<b>' + p1 + '</b>';
    else {
      // starts with A, B, C, D, E, F, G, H, I, J, K, L, M, N
      A2JS.forEach(prefix => {
        if (p1.startsWith(prefix)) {
          p1 = p1.replace(prefix, '<b>' + prefix + '</b> ');
        }
      });

      // highlight phrases
      for (const phrase of phrases) {
        const regex = new RegExp(phrase, 'gi');
        if (p1.toLowerCase().includes(phrase.toLowerCase())) {
          p1 = p1.replace(regex, match => `<b>${match}</b>`);
        }
      }
    }

    ps[i] = p1;
  });

  return ps;
};


async function processFiles(freq, outs, freqGroup, dirPath, wordSet, tests, prefix) {
  const files = await fs.readdir(dirPath);
  for (let i = 0; i < files.length; i++) {
    const content = await fs.readFile(path.join(dirPath, files[i]), 'utf-8');
    processGroup(freqGroup, content);

    tests.push({
      name: `${prefix}/${path.parse(files[i]).name}`,
      paragraph: getParagraphs(content)
    });
    const words = content.replace(/(?:\r\n|\r|\n)/g, ' ').split(/[ \:!\)\(\.\?\-;\,'''""]/);
    for (let j = 0; j < words.length; j++) {
      const word = words[j].trim();
      if (/^[a-z]{3,}$/.test(word)) {
        wordSet.add(word);
        freq[word] = (freq[word] || 0) + 1;
      } else {
        outs.add(word);
      }
    }
  }
}

async function process() {
  const tests = [];
  const all = new Set();
  const outs = new Set();
  const allReadings = new Set();
  const freq = {};
  const freqGroup = {};


  await processFiles(freq, outs, freqGroup, listeningPathA, all, tests, 'ALS');
  await processFiles(freq, outs, freqGroup, readingPathA, allReadings, tests, 'ARE');
  await processFiles(freq, outs, freqGroup, listeningPath, all, tests, 'GLS');
  await processFiles(freq, outs, freqGroup, readingPath, allReadings, tests, 'GRE');

  await fs.writeFile('./src/tests.json', JSON.stringify(tests));

  const data = Array.from(new Set([...all, ...allReadings])).sort();
  console.log('allWords', data.length);
  await fs.writeFile('./allWords.txt', data.join('\n'));

  const keyData = data.filter(it => freq[it] > 1);
  console.log('keyData', keyData.length);
  await fs.writeFile('./allKeyWords.txt', keyData.join('\n'));

  const trivalData = data.filter(it => freq[it] <= 1);
  console.log('trivalData', trivalData.length);
  await fs.writeFile('./allTrivalWords.txt', trivalData.join('\n'));

  const listeningOnly = Array.from(all).sort();
  await fs.writeFile('./listeningOnly.txt', listeningOnly.join('\n'));

  const dataReadings = [];
  for (let word of allReadings) {
    if (!all.has(word)) {
      dataReadings.push(word);
    }
  }
  const readingOnly = Array.from(dataReadings).sort();
  await fs.writeFile('./readingOnly.txt', readingOnly.join('\n'));

  const dataOut = Array.from(outs).sort();
  await fs.writeFile('./outliers.txt', dataOut.join('\n'));

  const groupData = Object.keys(freqGroup).filter(it => freqGroup[it] >= 5).sort();
  console.log('groupData', groupData.length);
  await fs.writeFile('./allWordGroups.txt', groupData.join('\n'));

  console.log('phrases', phrases.length);

}

process();
