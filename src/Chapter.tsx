import './fonts.css';
import * as React from 'react';
import './Chapter.css';

type ScrollCallbackFunction = (uid: string, doscroll?: boolean) => void;
type PlainCallbackFunction = () => void;

export interface ChapterProps {
  name: string; // the chapter title
  content: string[]; // the actual text
  choices: Map<string, ChoiceConfig>; // the choices template
  slot: number; // which slot this chapter uses
  uid: string; // this uid
  next: string; // the next chapter uid
  also?: string; // The 
  scrollto: ScrollCallbackFunction; // the function from App to call to goto next chapter
  callOnLoad: ScrollCallbackFunction|null; // the function to call after mounting self
}

export type Choice = [string, boolean, string]|[string, boolean];

export interface ChoiceConfig {
  header: string;
  choices: Choice[];
}

interface ParagraphProps {
  content: string;
  config: ChapterProps;
  callback: PlainCallbackFunction;
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
          let brackettext = arr[1] ? '[X]' : '[ ]';
          let onClick = undefined;
          if (arr[1] && (arr.length <= 2 || arr[2] !== 'nolink')) {
            className += ' choicelink';
            onClick = props.callback;
          }
          return (
            <p className={className} key={i} onClick={onClick}>
              <span className="bracket">{brackettext}</span>
              <span className="choicetext">{arr[0]}</span>
            </p>
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

export class Chapter extends React.Component<ChapterProps, Object> {
  constructor(props: ChapterProps) {
    super(props);
  }

  render() {
    let scrollto = this.props.scrollto;
    let myprops = this.props;
    return (
        <div className="Chapter">
          <span className="chaptername">{this.props.name}</span>
          <div className="paragraphs">
            {this.props.content.map((p, i) => (
              <Paragraph
                content={p}
                config={this.props}
                key={i}
                callback={() => {
                  scrollto(myprops.next);
                  if (myprops.also) {
                    scrollto(myprops.also, false);
                  }
                }}
              />
            ))}
          </div>
        </div>
    );
  }
}