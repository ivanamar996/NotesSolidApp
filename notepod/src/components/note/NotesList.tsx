import React from 'react';
import NoteModel from '../../models/Note';
import NotepadModel from '../../models/Notepad';
import { NewNote } from './NewNote';
import { Note } from './Note';
import SolidBackend from '../../services/SolidBackend';
import { SearchNotes } from './SearchNotes';

interface Props {
  webId: string;
  notepad: NotepadModel;
};

export const NotesList: React.FC<Props> = (props) => {

  const [notesArray, setNotesArray] = React.useState<NoteModel[]>([]);
  const [notes, setNotes] = React.useState<NoteModel[]>([]);


    if (props.notepad.url && notes.length==0) {
      getNotes(props.notepad.url).then(function(parsedData) {
        if(parsedData.length>0){
          setNotesArray(parsedData);
          setNotes(parsedData);
        }
      });
    }


  async function getNotes(notepadUrl: string) {
    return await SolidBackend.getNotes(notepadUrl);
  }

  async function saveNote(title: string, content: string, tags: string[]) {
    await SolidBackend.createNote(props.webId, props.notepad.url, title, content, tags).then(function (parsedData) {
      setNotesArray(notesArray => [...notesArray, parsedData]);
      setNotes(notes => [...notes, parsedData]);
    });
  }

  const splitEvery = (array: any, length: any) =>
    array.reduce(
      (result: any, item: any, index: any) => {
        if (index % length === 0) result.push([])
        result[Math.floor(index / length)].push(item)
        return result
      },
      []
    )
  function searchNotes(criteria:string){
    setNotes([]);
    if(notesArray.length>0){
      notesArray.forEach((note:NoteModel)=>{
        if(note.title.includes(criteria))
          setNotes(array=>[...array,note]);
      });
    }
  }

  function cancelSearchNote(){
    setNotes([]);
    setNotes(notesArray);
  }

  async function deleteNote(note:NoteModel){
    await SolidBackend.deleteNote(note).then((success:any)=>{
      const pom = [...notesArray];
      const index = pom.indexOf(note);
      pom.splice(index,1);
      setNotes(pom);
      setNotesArray(pom);
    });
  }

  return (
    <>
      <section className="section">
        <SearchNotes cancelSearchNote={cancelSearchNote} searchNotes={(criteria:string)=>searchNotes(criteria)}/>
      </section>
      <section className="section" style={{ marginTop: -120 }}>
        <NewNote onSave={saveNote} />
      </section>
      <section className="section">
        {
          splitEvery(notes, 3).map((subArray: NoteModel[], index1: number) => (
            <div className="wrapper" key={index1}>
              {
                subArray.map((note: NoteModel, index) => {
                  if (index == 0)
                    return <div key={index} className="left"><Note deleteNote={(note:NoteModel)=>deleteNote(note)} note={note} /></div>;
                  else if (index == 1)
                    return <div key={index} className="middle"><Note deleteNote={(note:NoteModel)=>deleteNote(note)} note={note} /></div>;
                  else
                    return <div key={index} className="right"><Note deleteNote={(note:NoteModel)=>deleteNote(note)} note={note} /></div>;
                })
              }
            </div>
          ))
        }
      </section>
    </>
  );
};

