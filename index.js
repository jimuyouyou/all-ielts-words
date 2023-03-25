const fs = require('fs').promises;
const path = require('path');

const dataPath = './data/listening';
const readingPath = './data/reading';

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

async function process() {
  const tests = [];
  const all = new Set();
  const outs = new Set();
  const allReadings = new Set();
  const freq = {};
  const freqGroup = {};

  let files = await fs.readdir(dataPath);
  for (let i = 0; i < files.length; i++) {
    const content = await fs.readFile(path.join(dataPath, files[i]), 'utf-8');
    processGroup(freqGroup, content);
    tests.push({
      name: `LS/${path.parse(files[i]).name}`,
      paragraph: content.split(/(?:\r\n|\r|\n)/g).filter(s => s.trim().length > 2)
    });
    const words = content.replace(/(?:\r\n|\r|\n)/g, ' ').split(/[ \:!\)\(\.\?\-;\,'‘’“”]/);
    for (let j = 0; j < words.length; j++) {
      const word = words[j].trim();
      if (/^[a-z]{3,}$/.test(word)) {
        all.add(word);
        freq[word] = (freq[word] || 0) + 1;
      } else {
        outs.add(word);
      }
    }
  }

  files = await fs.readdir(readingPath);
  for (let i = 0; i < files.length; i++) {
    const content = await fs.readFile(path.join(readingPath, files[i]), 'utf-8');
    processGroup(freqGroup, content);
    tests.push({
      name: `RE/${path.parse(files[i]).name}`,
      paragraph: content.split(/(?:\r\n|\r|\n)/g).filter(s => s.trim().length > 2)
    });
    const words = content.replace(/(?:\r\n|\r|\n)/g, ' ').split(/[ \:!\)\(\.\?\-;\,'‘’“”]/);
    for (let j = 0; j < words.length; j++) {
      const word = words[j].trim();
      if (/^[a-z]{3,}$/.test(word)) {
        allReadings.add(word);
        freq[word] = (freq[word] || 0) + 1;
      } else {
        outs.add(word);
      }
    }
  }

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

}

process();
