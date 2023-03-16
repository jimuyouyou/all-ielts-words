import logo from './logo.svg';
import './App.css';
import PouchDB from 'pouchdb';

var db = new PouchDB('http://root:123456@localhost:5984/kittens');

async function test() {
  const info = await db.info();
  console.log(info);

  var doc = {
    "_id": `${Math.random()}`,
    "name": "Mittens",
    "occupation": "kitten",
    "age": 3,
    "hobbies": [
      "playing with balls of yarn",
      "chasing laser pointers",
      "lookin' hella cute"
    ]
  };
  db.put(doc);
}

function App() {
  test();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
