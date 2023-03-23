import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { getAll, upsert, remove } from './db.js';


function App() {
  const [text, setText] = useState('');
  const [allData, setAllData] = useState([]);

  const handleText = (e) => {
    setText(e.target.value);
  };

  const handleCreate = async () => {
    const dbText = text.trim();
    console.log('dbText', dbText);

    if (dbText) {
      const hasOne = allData.find(d => d.tag === dbText);
      if (!hasOne) {
        const clone = allData.slice();
        clone.unshift({
          _id: `${new Date().getTime()}`,
          tag: dbText,
          list: ['', '', ''],
        });
        setAllData(clone);
      }
    }
  };


  const handleTagChange = async (id, val) => {
    // if (!val) return;

    console.log('handleTagChange', [id, val]);
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
      const newDoc = Object.assign({}, doc, { tag, _id: `${new Date().getTime()}` });
      delete newDoc._rev;
      await upsert(newDoc);

      // fetch all
      const data = await getAll();
      console.log('handleTagBlur data', data);
      setAllData(data);
    }
  };

  const handleGroupChange = async (id, val, groupInd) => {
    console.log('handleGroupChange', [id, val, groupInd]);
    const clone = allData.slice();
    const doc = clone.find(it => it._id === id);
    if (doc) {
      doc.list[groupInd] = val;
      setAllData(clone);
    }
  };

  const handleGroupBlur = async (id) => {
    const doc = allData.find(it => it._id === id);
    await upsert(doc);

    const data = await getAll();
    console.log('updated data', data);
    setAllData(data);
  };

  useEffect(() => {
    async function fetchAll() {
      const data = await getAll();
      console.log('init data', data);
      setAllData(data);
    };

    fetchAll();
  }, []);

  console.log('alldata', allData);

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
        {allData && allData.map((dt, dtInd) => {

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
                        onBlur={() => handleGroupBlur(dt._id)} />
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
    </div>
  );
}

export default App;
