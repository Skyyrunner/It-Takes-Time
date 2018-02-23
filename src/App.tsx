import * as React from 'react';
import './App.css';
import 'whatwg-fetch';
import { mapGetOrDie } from './Utility';
import { Chapter, ChapterProps, ChoiceConfig } from './Chapter';

type scrollToComponentFunction = (ref: React.ReactInstance, options?: Object) => void;
const scrollToComponent: scrollToComponentFunction = require('react-scroll-to-component');

interface AppState {
  slots: (ChapterProps|null)[];
  chapters: Chapter[];
  chapterinfo: Map<string, ChapterProps>;
}

class App extends React.Component<Object, AppState> {
  refFromUID: Map<string, React.ReactInstance>;

  constructor(props: Object) {
    super(props);
    this.refFromUID = new Map<string, React.ReactInstance>();
    this.state = {slots: [],
      chapters: [],
      chapterinfo: new Map<string, ChapterProps>()
    };
    // let call this from other classes
    this.scrollToChapter = this.scrollToChapter.bind(this);
    this.scrollToLoadedChapter = this.scrollToLoadedChapter.bind(this);
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
              scrollto: this.scrollToChapter,
              callOnLoad: null
            };

            if (data.also) {
              o.also = data.also;
            }
    
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
        let chapterstart = mapGetOrDie<string, ChapterProps>('00', map);
        let chapterone = mapGetOrDie<string, ChapterProps>('01', map);
        let initchapter = mapGetOrDie<string, ChapterProps>('13', map);
        let slots: (ChapterProps|null)[] = [chapterstart, chapterone, initchapter];
        this.setState(oldstate => ({chapterinfo: map, slots: slots}));
    });
  }

  scrollToLoadedChapter(uid: string) {
    let chapterobj = this.refFromUID.get(uid);
    if (chapterobj) {
      scrollToComponent(chapterobj, {align: 'top', duration: 500});
    }
  }

  // dontscroll is if you want to setchapter from <Chapter/> using
  // this callback, but not actually scroll to it.
  scrollToChapter(uid: string, doscroll: boolean = true) {
    if (this.refFromUID.get(uid) !== undefined) {
      if (doscroll) {
        this.scrollToLoadedChapter(uid);
      }
    } else {
      // Load uid and possibly scroll to it
      this.setChapter(uid, doscroll);
    }
  }

  setChapter(uid: string, scrollOnLoad: boolean = false) {
    var maybeinfo = this.state.chapterinfo.get(uid);
    if (maybeinfo !== undefined) {
      let info = maybeinfo;

      if (scrollOnLoad) {
        info.callOnLoad = this.scrollToLoadedChapter;
      }

      // Update state only if the existing one in the slot is incorrect
      this.setState(oldstate => {
        let newstate = {...oldstate};
        let slots = newstate.slots;
        // check whether the slot exists.
        if (slots.length <= info.slot) {
          while (slots.length < info.slot) {
            slots.push(null);
          }
          slots.push(info);
        } else {
          let existingchapter = this.state.slots[info.slot];
          if (existingchapter && existingchapter.uid === info.uid) {
            return;
          } else {
            // otherwise, replace with new
            this.state.slots[info.slot] = info;
          }
        }
        return newstate;
      });
      
    } else {
      throw new Error(`Chapter with uid ${uid} does not exist.`);
    }
  }

  render() {
    return (
      <div className="App">
        {this.state.slots.filter(d => d !== null).map(
          (d: ChapterProps) => (<Chapter
            {...d}
            key={d.uid}
            ref={(ref) => {
              if (ref !== null) {
                this.refFromUID.set(d.uid, ref);
                if (d.callOnLoad) {
                  d.callOnLoad(d.uid);
                }
              }
            }}
          />)
        )}
      </div>
    );
  }
}

export default App;
