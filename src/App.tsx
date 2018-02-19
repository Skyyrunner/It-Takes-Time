import * as React from 'react';
import './App.css';
import 'whatwg-fetch';
import { mapGetOrDie } from './Utility';
import { Chapter, ChapterProps, ChoiceConfig } from './Chapter';

interface AppState {
  slots: (ChapterProps|null)[];
  chapters: Chapter[];
  numchapters: number;
  chapterinfo: Map<string, ChapterProps>;
}

class App extends React.Component<Object, AppState> {
  constructor(props: Object) {
    super(props);
    this.state = {slots: [],
      chapters: [],
      chapterinfo: new Map<string, ChapterProps>(),
      numchapters: 0
    };
  }

  componentDidMount() {
    // load all storydata
    fetch('/data/storydata.json')
      .then(response => response.json())
      .then(json => {
        let map = new Map<string, ChapterProps>();
        for (let key in json) {
          if (json.hasOwnProperty(key)) {
            let data = json[key];
            let o: ChapterProps = {
              name: data.name,
              next: data.next,
              slot: data.slot,
              uid: data.uid,
              content: [],
              choices: new Map<string, ChoiceConfig>(),
              key: -1
            };
    
            let L = data.content.length;
            for (let i = 0; i < L; i++) {
              o.content.push(data.content[i]);
            }

            let choices: Object = data.choices;
            for (let choicekey in choices) {
              if (choices.hasOwnProperty(choicekey)) {
                o.choices.set(choicekey, data.choices[choicekey]);
              }
            }

            map.set(o.uid, o);
          }
        }
        // done dealing with json, now update state
        let chapter00 = mapGetOrDie<string, ChapterProps>('00', map);
        let chapter01 = mapGetOrDie<string, ChapterProps>('01', map);
        let numchapters = this.state.numchapters;
        let slots: (ChapterProps|null)[] = [];
        chapter00.key = numchapters++;
        slots.push(chapter00);
        chapter01.key = numchapters++;
        slots.push(chapter01);
        this.setState(oldstate => ({chapterinfo: map, numchapters: numchapters, slots: slots}));
    });
  }

  setChapter(uid: string): Chapter {
    let info = this.state.chapterinfo.get('00');
    if (info !== undefined) {
      let numchapters = this.state.numchapters;
      let slots = this.state.slots.slice();
      // check whether the slot exists.
      if (info.slot < slots.length) {
        while (slots.length < info.slot) {
          slots.push(null);
        }
        info.key = numchapters++;
        slots.push(info);
      }
      this.setState(oldstate => ({numchapters: numchapters, slots: slots}));
    }
    throw new Error(`Chapter with uid ${uid} does not exist.`);
  }

  render() {
    return (
      <div className="App">
        {this.state.slots.filter(d => d !== null).map((d: ChapterProps) => (<Chapter {...d} key={d.key}/>))}
      </div>
    );
  }
}

export default App;
