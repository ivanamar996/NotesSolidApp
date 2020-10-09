import React from 'react';

interface Props {
  onSave: (title: string, notes: string) => Promise<void>;
};

export const NewNote: React.FC<Props> = (props) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState('');
  const [noteInput, setNoteInput] = React.useState('');
  const [notesArray, setNotesArray] = React.useState<string[]>([]);

  const saveNote: React.FormEventHandler = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    await props.onSave(noteTitle, notesArray.toString());
    setNoteTitle('');
    setNoteInput('');
    setNotesArray([]);
    setIsSubmitting(false);
  };

  const isLoading = isSubmitting ? 'is-loading' : '';

  return <>
    <form onSubmit={saveNote}>
      <div className="field">
        <div className="control">
          <input type="text"
            className="input"
            value={noteTitle}
            onChange={(e) => { e.preventDefault(); setNoteTitle(e.target.value); }}
            placeholder="title"
          />
          <div className="columns">
            <div className="column">
              <input
                onChange={(e) => { e.preventDefault(); setNoteInput(e.target.value); }}
                name="note"
                id="note"
                value={noteInput}
                className="input"
                placeholder="note"
                style={{ marginTop: 10 }}
              />
            </div>
            <div className="field">
              <div className="control column" style={{ marginTop: 10 }}>
                <button
                  onClick={(e) => { e.preventDefault(); setNotesArray(notesArray => [...notesArray, noteInput]); setNoteInput(''); }}
                  style={{ width: 80, height: 35 }}
                  className={`button is-primary`}
                >Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="field">
        <div className="control">
          {notesArray.map(note => note && <input type="text"
            value={note}
            className="input"
            style={{marginTop:2}}
            disabled={true}
          />)}
        </div>
      </div>
      <div className="field">
        <div className="control">
          <button
            type="submit"
            className={`button is-primary ${isLoading}`}
            disabled={isSubmitting}
          >Add note</button>
        </div>
      </div>
    </form>
  </>;
};
