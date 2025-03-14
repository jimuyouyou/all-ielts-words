import { useState, useEffect } from 'react';
// import logo from './logo.svg';
import './App.css';
import { getAll, upsert, remove } from './db.js';
import tests from './tests.json';
import { Hilitor } from './Hiltor';

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(html) {
  const container = document.createElement('div');
  container.innerHTML = html;

  const blob = new Blob([container.innerHTML], { type: 'text/html' });
  const clipboardItem = new ClipboardItem({ 'text/html': blob });

  navigator.clipboard.write([clipboardItem]).then(function () {
    console.log('Async: Copying to clipboard was successful!');
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
    fallbackCopyTextToClipboard(container.innerText);
  });
}

function getSentences(text) {
  if (!text) return [];

  const res = [];
  tests.forEach(test => {
    test.paragraph.forEach((p, pInd) => {
      if (p.includes(text)) {
        res.push({ name: test.name, paragraph: p, pInd });
      }
    });
  });

  return res;
}


function App() {
  const [test, setTest] = useState('');
  const [testName, setTestName] = useState('');
  const [text, setText] = useState('');
  const [allData, setAllData] = useState([]);

  const handleText = (e) => {
    setText(e.target.value);
  };

  const handleCreate = async () => {
    const dbText = text.trim();
    // console.log('dbText', dbText);

    if (dbText) {
      const hasOne = allData.find(d => d.tag === dbText);
      if (!hasOne) {
        const clone = allData.slice();
        clone.unshift({
          _id: dbText,
          tag: dbText,
          list: ['', '', '', '', ''],
        });
        setAllData(clone);
      }
    }
  };


  const handleTagChange = async (id, val) => {
    if (!val) return;

    // console.log('handleTagChange', [id, val]);
    const clone = allData.slice();
    const doc = clone.find(it => it._id === id);
    if (doc) {
      if (!doc.oldTag) doc.oldTag = doc.tag;
      doc.tag = val;
      setAllData(clone);
    }
  };

  const handleTagBlur = async (id) => {
    const doc = allData.find(it => it._id === id);
    const { tag, oldTag } = doc;
    if (oldTag) {
      // delete old tag data
      Object.assign(doc, { tag: oldTag });
      delete doc.oldTag;
      await remove(doc);

      // add new tag data
      const newDoc = Object.assign({}, doc, { tag, _id: tag });
      delete newDoc._rev;
      await upsert(newDoc);

      // fetch all
      const data = await getAll();
      // console.log('handleTagBlur data', data);
      setAllData(data);
    }
  };

  const handleGroupChange = async (id, val, groupInd) => {
    // console.log('handleGroupChange', [id, val, groupInd]);
    const clone = allData.slice();
    const doc = clone.find(it => it._id === id);
    if (doc.list.length !== 5) {
      for (let i = doc.list.length; i < 5; i++) doc.list.push('');
    }
    if (doc) {
      doc.list[groupInd] = val;
      setAllData(clone);
    }
  };

  const handleGroupBlur = async (e, id) => {
    // e.target.classList.remove('doubled');
    const doc = allData.find(it => it._id === id);
    await upsert(doc);

    const data = await getAll();
    // console.log('updated data', data);
    setAllData(data);
  };

  const handleTestShow = (testName) => {
    setTestName(testName);
    setTest(tests.find(t => t.name === testName).paragraph.join('<br/><br/>'));
  };

  // init data
  useEffect(() => {
    async function fetchAll() {
      const data = await getAll();
      // console.log('init data', data);
      setAllData(data);
    };

    fetchAll();
  }, []);

  // update window search
  useEffect(() => {
    if (text && text.length > 3) {
      var myHilitor = new Hilitor("searchedSentences")
      myHilitor.setMatchType("open"); // id of the element to parse
      myHilitor.apply(text);
    }
  }, [text]);

  // console.log('alldata', allData);
  // console.log('tests', tests);

  const showData = text ? allData.filter(dt => dt.tag.toLowerCase().includes(text.toLowerCase())) : allData;
  const showSentences = (text && text.length > 3) ? getSentences(text) : [];

  return (
    <div className="App">
      <header className="App-header">
      </header>

      <div className='search-wrapper'>
        <div className='search-input'>
          <input type="text" placeholder='Search' onChange={handleText} />
        </div>
        <div className='create-button'>
          <button onClick={handleCreate}>Create</button>
        </div>
      </div>

      <div className='list-wrapper'>
        {showData && showData.map((dt, dtInd) => {

          return (
            <div key={dt._id} className='list-groups' >
              <div className='tag-wrapper'>
                <input type="text" value={dt.tag}
                  onChange={(e) => handleTagChange(dt._id, e.target.value)}
                  onBlur={(e) => handleTagBlur(dt._id)}
                />
              </div>
              <div className='groups-wrapper'>
                {dt.list && dt.list.map((group, groupInd) => {

                  return (
                    <div key={groupInd} className='group-wrapper'>
                      <textarea value={group}
                        onChange={(e) => handleGroupChange(dt._id, e.target.value, groupInd)}
                        // onDoubleClick={(e) => e.target.classList.add('doubled')}
                        onBlur={(e) => handleGroupBlur(e, dt._id)} />
                    </div>
                  )
                }
                )}
              </div>
            </div>
          )
        }
        )}
      </div>

      <div className='sentences-wrapper' id="searchedSentences">
        {showSentences && showSentences.map((ss, tsInd) => {
          return (
            <div key={ss.name + ss.pInd} className='sent-wrapper' title={ss.name}>
              {/* <span dangerouslySetInnerHTML={{ __html: ss.paragraph }} /> */}
              {ss.paragraph.replaceAll('<b>', '').replaceAll('</b>', '')}
              ({ss.name})
            </div>
          )
        })}
      </div>

      <div className='tests-wrapper'>
        {!text && tests && tests.map((ts, tsInd) => {

          return (
            <div key={ts.name} className='test'>
              <button onClick={() => handleTestShow(ts.name)}>{ts.name}</button>
            </div>
          )
        })}
      </div>
      <div className='test-panel'>
        {test &&
          <div style={{ color: 'blue' }}>
            <h3>
              <button onClick={() => setTest('')}>HIDE THE PASSAGE</button> &nbsp;&nbsp;&nbsp;
              <button onClick={() => copyTextToClipboard(document.getElementById('testContent').innerHTML)}>COPY THE PASSAGE</button>
            </h3>
          </div>
        }

        {testName && <h2>{testName}</h2>}
        {!text && <div id="testContent" dangerouslySetInnerHTML={{ __html: test }} />}
      </div>
    </div >
  );
}

export default App;
