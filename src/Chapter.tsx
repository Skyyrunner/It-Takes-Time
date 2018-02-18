import './fonts.css';
import * as React from 'react';
import './Chapter.css';

interface ChapterProps {
  path: string;
}

type Choice = [string, boolean, string]|[string, boolean];

interface ChoiceConfig {
  header: string;
  choices: Choice[];
}

interface ChapterState {
  path: string;
  name: string|null;
  content: string[];
  choices: Map<string, ChoiceConfig>;
  index: string|null;
}

interface ParagraphProps {
  content: string;
  config: ChapterState;
}

function renderDangerously(content: string) {
  return {__html: content};
}

function Paragraph(props: ParagraphProps) {
  if (props.content.startsWith('%%') && props.content.endsWith('%%')) {
    if (!props.content) {
      throw new Error('props.content does not exist.');
    }
    let choicetype = props.content.slice(2, props.content.length - 2);
    // it doesn't exist in the non-null object choices
    if (!props.config.choices.has(choicetype)) {
      throw new Error(`The choice ${choicetype} does not exist in the choices.`);
    }
    var choiceinfo = props.config.choices.get(choicetype) as ChoiceConfig; // we know it exists

    return (
      <div className="Paragraph questchoices">
        <p className="choiceHeader">{choiceinfo.header}</p>
        {choiceinfo.choices.map((arr, i) => {
          let className = arr[1] ? 'choice chosen' : 'choice';
          return (
            <p className={className} key={i}>{'[ ] ' + arr[0]}</p>
          );
        })}
      </div>
    );
  }
  // In the case that props is normal
  return (
    <p className="Paragraph" dangerouslySetInnerHTML={renderDangerously(props.content)}/>
  );
}

export default class Chapter extends React.Component<ChapterProps, ChapterState> {
  constructor(props: ChapterProps) {
    super(props);
    this.state = { path: props.path, name: null, content: [], index: null, choices: new Map() };
  }

  componentDidMount() {
    fetch(this.props.path)
      .then(response => response.json())
      .then(json => this.setState(state => {
        let o: ChapterState = {...state};
        o.name = json.name;
        o.index = json.index; 

        let L = json.content.length;
        for (let i = 0; i < L; i++) {
          o.content.push(json.content[i]);
        }        

        let choices: Object = json.choices;     
        for (let key in choices) {
          if (choices.hasOwnProperty(key)) {
            o.choices.set(key, json.choices[key]);
          }
        }
        return o;
      }));
  }

  render() {
    console.log(this.state);
    return (
        <div className="Chapter">
          <span className="chaptername">{this.state.name}</span>
          <div className="paragraphs">
            {this.state.content.map((p, i) => (<Paragraph content={p} config={this.state} key={i}/>))}
          </div>
        </div>
    );
  }
}