const fs = require('fs').promises;
const path = require('path');

const dataPath = './data/listening';
const readingPath = './data/reading';

async function process() {
  const all = new Set();
  const outs = new Set();
  const allReadings = new Set();

  let files = await fs.readdir(dataPath);
  for (let i = 0; i < files.length; i++) {
    const content = await fs.readFile(path.join(dataPath, files[i]), 'utf-8');
    const words = content.replace(/(?:\r\n|\r|\n)/g, ' ').split(/[ \:!\)\(\.\?\-;\,'‘’“”]/);
    for (let j = 0; j < words.length; j++) {
      const word = words[j].trim();
      if (/^[a-z]{3,}$/.test(word)) {
        all.add(word);
      } else {
        outs.add(word);
      }
    }
  }

  files = await fs.readdir(readingPath);
  for (let i = 0; i < files.length; i++) {
    const content = await fs.readFile(path.join(readingPath, files[i]), 'utf-8');
    const words = content.replace(/(?:\r\n|\r|\n)/g, ' ').split(/[ \:!\)\(\.\?\-;\,'‘’“”]/);
    for (let j = 0; j < words.length; j++) {
      const word = words[j].trim();
      if (/^[a-z]{3,}$/.test(word)) {
        all.add(word);
        allReadings.add(word);
      } else {
        outs.add(word);
      }
    }
  }

  const data = Array.from(all).sort();
  await fs.writeFile('./words.txt', data.join('\n'));

  const dataOut = Array.from(outs).sort();
  await fs.writeFile('./outliers.txt', dataOut.join('\n'));

  const dataReadings = [];
  for (let word of allReadings) {
    if (!all.has(word)) {
      dataReadings.push(word);
    }
  }
  console.log(dataReadings.join(','));

}

process();
