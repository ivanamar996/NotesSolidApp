import React from 'react';
import { NewNotepad } from './NewNotepad';
import { Notepod } from './Notepad';
import SolidBackend from '../../services/SolidBackend';
import NotepadModel from '../../models/Notepad';
import { SearchNotepads } from './SearchNotepads';

interface Props {
  webId: string;
  handleOpenNotes: (notepad: NotepadModel) => void;
};

export const NotepadsList: React.FC<Props> = (props) => {

  const [notepadsArray, setNotepadsArray] = React.useState<NotepadModel[]>([]);
  const [notepads, setNotepads] = React.useState<NotepadModel[]>([]);

  if (props.webId != undefined && notepadsArray.length == 0) {
    getNotepads(props.webId).then(function (parsedData) {
      if (parsedData.length > 0){
        setNotepadsArray(parsedData);
        setNotepads(parsedData);
      }
    });
  }

  async function saveNotepod(title: string) {
    const newNotepad = await SolidBackend.createNotepad(title, props.webId, []);
    setNotepadsArray(notepadsArray => [...notepadsArray, newNotepad]);
    setNotepads(notepads => [...notepads, newNotepad]);
  }

  async function getNotepads(webId: string) {
    return await SolidBackend.getAllNotepads(webId);
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

  function searchNotepads(criteria:string){
    setNotepads([]);
    notepadsArray.forEach((notepad:NotepadModel)=>{
      if(notepad.title.includes(criteria))
        setNotepads(array=>[...array,notepad]);
    });
  }

  function cancelSearch(){
    setNotepads([]);
    setNotepads(notepadsArray);
  }

  return (
    <>
      <section className="section">
        <SearchNotepads cancelSearch={cancelSearch} searchNotepads={(criteria:string)=>searchNotepads(criteria)}/>
      </section>
      <section className="section" style={{ marginTop: -120 }}>
        <NewNotepad onSave={saveNotepod} />
      </section>
      <section className="section">
        {
          splitEvery(notepads, 3).map((subArray: NotepadModel[], index1: number) => (
            <div className="wrapper" key={index1}>
              {
                subArray.map((notepad: NotepadModel, index) => {
                  if (index == 0)
                    return <div key={index} className="left"><Notepod handleOpenNotes={(notepad: NotepadModel) => props.handleOpenNotes(notepad)} notepad={notepad} /></div>;
                  else if (index == 1)
                    return <div key={index} className="middle"><Notepod handleOpenNotes={(notepad: NotepadModel) => props.handleOpenNotes(notepad)} notepad={notepad} /></div>;
                  else
                    return <div key={index} className="right"><Notepod handleOpenNotes={(notepad: NotepadModel) => props.handleOpenNotes(notepad)} notepad={notepad} /></div>;
                })
              }
            </div>
          ))
        }
      </section>
    </>
  );
};
