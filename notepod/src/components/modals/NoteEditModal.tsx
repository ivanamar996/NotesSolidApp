import React from "react";
import SolidBackend from "../../services/SolidBackend";

const NoteEditModal = (props: any) => {

    const [title, setTitle] = React.useState(props.note.title);
    const [content, setContent] = React.useState(props.note.content);
    const [tag, setTag] = React.useState('');
    const [tags, setTags] = React.useState<string[]>(props.note.tags);

    const saveNote: React.FormEventHandler = async (event) => {
        event.preventDefault();
        props.note.title  = title;
        props.note.content = content;
        props.note.tags = tags;
        await SolidBackend.updateNote(props.note);
        props.handleClose();
    };

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
            setTags(array => [...array, tag]);
            setTag('');
        }
    }

    const tagsElement = tags.map((tag: string, index: number) => {
        if (tag.length > 0) {
            return <div className="divTags">
                <p className="tagClass" >{tag}</p>
                <input className="buttonXTag" type="button"
                    onClick={(e) => { e.preventDefault(); var pom = [...tags]; pom.splice(index, 1); setTags(pom) }}
                    value="X">
                </input>
            </div>
        }
    });

    return (
        <div className="popup-box">
            <div className="box">
                <form onSubmit={saveNote} className="content">
                    <hr></hr>
                    <div className="field">
                        <div className="control" >
                            <input type="text"
                                id="noteTitleID"
                                className="input"
                                value={title}
                                onChange={(e) => { e.preventDefault(); setTitle(e.target.value); }}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <div className="control">
                            <textarea
                                id="textareaNote"
                                className="form-control input"
                                style={{ marginTop: -7, width: 600, height: 100, resize: "vertical" }}
                                rows={5}
                                value={content}
                                onChange={(e) => { e.preventDefault(); setContent(e.target.value); }}
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
                                style={{ marginTop: 5 }}
                            />
                        </div>
                        <div className="control">
                            {tagsElement}
                        </div>
                    </div>
                    <hr></hr>
                    <div className="flex-box-2">
                        <button className="transparentBtn" style={{ marginRight: 40 }} onClick={props.handleClose}> Cancel </button>
                        <button className="transparentBtn" style={{ marginRight: 20 }} type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NoteEditModal;