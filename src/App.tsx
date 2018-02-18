import * as React from 'react';
import './App.css';
import 'whatwg-fetch';
import Chapter from './Chapter';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Chapter path="/storydata/1-1.json"/>
      </div>
    );
  }
}

export default App;
