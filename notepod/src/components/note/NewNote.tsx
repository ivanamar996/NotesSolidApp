import React from 'react';
import { useComponentVisible } from '../../hooks/useComponentVisible';

interface Props {
  onSave: (title:string, content:string,tags:string[]) => Promise<void>;
};

export const NewNote: React.FC<Props> = (props) => {

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [tag, setTag] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const { ref, isComponentVisible, setIsComponentVisible, titlePlaceholder, setTitlePlaceholder } = useComponentVisible(false, "New note...");

  async function saveNote(e:any) {
    e.preventDefault();
    await props.onSave(title,content,tags).then(()=>{
      setTitle('');
      setContent('');
      setTag('');
      setTags([]);
      setIsComponentVisible(false);
      setTitlePlaceholder('New note...');
    });
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

    }
  }

  const handleKeyDownTag = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      setTags(array=>[...array, tag]);
      setTag('');
    }
  }

  const toggleDivOpen = () => {
    setIsComponentVisible(true);
    setTitlePlaceholder('Title');
  }

  const handleCancel = () => {
    setIsComponentVisible(false);
    setTitlePlaceholder('New note...');
  }

  const tagsElement = tags.map((tag:string, index:number)=>{
  return (
    <div className="divTags">
      <p className="tagClass" >{tag}</p>
      <input className="buttonXTag" type="button" 
            onClick={(e) => { e.preventDefault(); var pom = [...tags]; pom.splice(index,1); setTags(pom)}} 
            value="X"></input>
    </div>
  )
  });

  return <>
    <div ref={ref} className="divShadow" style={{ marginLeft: 450, width: 600 }}>
      <form>
        <div className="field">
          <div className="control" onClick={toggleDivOpen}>
            <input type="text"
              id="noteTitleID"
              className="input"
              value={title}
              onChange={(e) => { e.preventDefault(); setTitle(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder={titlePlaceholder}
            />
          </div>
        </div>
        {isComponentVisible &&
          <div className="field">
            <div className="control">
              <textarea
                id="textareaNote"
                className="form-control input"
                style={{ marginTop:-7,width: 600, height: 100, resize: "vertical" }}
                rows={5}
                value={content}
                onChange={(e) => { e.preventDefault(); setContent(e.target.value); }}
                placeholder="Write note..."
              />
            </div>
            <div className="control">
              <input type="text"
                id="tagID"
                className="input"
                value={tag}
                onChange={(e) => { e.preventDefault(); setTag(e.target.value); }}
                onKeyDown={handleKeyDownTag}
                placeholder="Add tag"
                style={{marginTop:5}}
              />
            </div>
            <div className="control">
              {tagsElement}
            </div>
            <div className="control flex-box-note-2">
            <button className="saveCancelNoteBtn" style={{marginRight:40}} onClick={handleCancel}> Cancel </button>
            <button className="saveCancelNoteBtn" style={{marginRight:20}} onClick={(e) => {saveNote(e)}}>Save</button>
          </div>
          </div>     
        }
      </form>
    </div>
  </>
};
