const fs = require('fs').promises;
const path = require('path');

const dataPath = './';

async function process() {
  const all = new Set();
  const out = new Set();
  const content = await fs.readFile(path.join(dataPath, './temp.txt'), 'utf-8');
  const words = content.replace(/(?:\r\n|\r|\n)/g, ' ').split(/[ \:!\)\(\.\?;\,‘’“”]/);
  for (let j = 0; j < words.length; j++) {
    const word = words[j].trim();
    if (/^[a-z]{3,}$/.test(word) || word.length > 3) {
      all.add(word);
    } else {
      out.add(word);
    }
  }

  const data = Array.from(all).sort();
  console.log('allWords', data.length);
  await fs.writeFile('./tempUnique.txt', data.join('\n'));
  console.log(out);

}

process();
