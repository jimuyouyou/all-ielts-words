import { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { getAll, upsert } from './db.js';


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
          _id: dbText,
          tag: dbText,
          list: ['', '', ''],
        });
        setAllData(clone);
      }
    }
  };

  const handleGroupChange = async (id, val, groupInd) => {
    console.log('handleGroupChange', [id, val, groupInd]);
    const clone = allData.slice();
    const group = clone.find(it => it._id === id);
    if (group) {
      group.list[groupInd] = val;
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
            <div key={dt._id} className='list-groups'>
              <div className='tag-wrapper'>{dt.tag}</div>
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
