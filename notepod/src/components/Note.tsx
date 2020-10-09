import React from 'react';
import { TripleSubject } from 'plandoc';
import { schema } from 'rdf-namespaces';
import moment from 'moment';

interface Props {
  note: TripleSubject;
  onChange: (title: string, notes: string) => Promise<TripleSubject | undefined>;
  onCancelEdit: () => void;
  mode?: 'viewing' | 'editing';
};

export const Note: React.FC<Props> = (props) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [title, setTitle] = React.useState(props.note.getString(schema.title)!);
  const [notes, setNotes] = React.useState(props.note.getString(schema.text));
  const [noteModifiedDate, setDate] = React.useState(props.note.getDateTime(schema.dateCreated));
  const [notesArray, setNotesArray] = React.useState<string[]>(notes?.split(',') || []);
  const [noteInput, setNoteInput] = React.useState('');

  const saveNote: React.FormEventHandler = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    await props.onChange(title, notesArray.toString());
    setIsSubmitting(false);
  };

  const cancelEdit: React.MouseEventHandler = (event) => {
    props.onCancelEdit();
  };

  if (props.mode === 'editing') {
    const isLoading = isSubmitting ? 'is-loading' : '';

    return <>
      <form onSubmit={saveNote} className="content">
        <div className="field">
          <div className="control">
            <input type="text"
              className="input"
              value={title}
              onChange={(e) => { e.preventDefault(); setTitle(e.target.value); }}
              placeholder="title"
              disabled={isSubmitting}
            />
          </div>
        </div>
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
              disabled={isSubmitting}
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
        {notesArray.map((note, index) => note &&
          <div className="field">
            <div className="control">
              <div className="columns">
                <div className="column">
                  <input type="text"
                    value={note}
                    className="input"
                    style={{ marginTop: 1 }}
                    disabled={true}
                  />
                </div>
                <div className="field">
                  <div className="control column">
                    <button
                      onClick={(e) => { e.preventDefault(); var npom = [...notesArray]; npom.splice(index,1); setNotesArray(npom)}}
                      style={{color:'red'}}
                      className={`button`}
                    >Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="field is-grouped">
          <div className="control">
            <button
              type="submit"
              className={`button is-primary ${isLoading}`}
              disabled={isSubmitting}
            >Save</button>
          </div>
          <div className="control">
            <button onClick={cancelEdit} className="button is-text">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </>;
  }

  return <>
    <div className="rows">
      <div className="column has-text-right">
        <p>Modified at: {moment(noteModifiedDate).format('DD/MM/YYYY')}</p>
      </div>
      <article className="card column content">
        <div className="section content">
          <div className="field">
            <div className="control">
              <input type="text"
                className="input"
                value={title}
                style={{marginTop:-30}}
                placeholder="title"
                disabled={true}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              {notesArray.map(note => note && <input type="text"
                value={note}
                className="input"
                style={{ marginTop: 2 }}
                disabled={true}
              />)}
            </div>
          </div>
        </div>
      </article>
    </div>
  </>;
};
