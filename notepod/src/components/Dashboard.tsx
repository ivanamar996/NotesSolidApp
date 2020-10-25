import React, { useEffect } from 'react';
import { LogoutButton, useWebId } from '@solid/react';
import { NotepadsList } from './notepad/NotepadsList';
import { NotesList } from './note/NotesList';
import SolidBackend from '../services/SolidBackend';
import Utils from '../services/Utils';
import '../App.scss';
import NotepadModel from '../models/Notepad';

export const Dashboard: React.FC = () => {

  const [openNotes, setOpenNotes] = React.useState(false);
  const [notepad, setNotepad] = React.useState<NotepadModel>();

  const webId = useWebId();

  useEffect(() => {
    if (webId != undefined)
      createFolders(webId);
  }, [webId]);

  async function createFolders(webId: any) {
    const baseUrl = Utils.getBaseUrl(webId);
    await SolidBackend.createAppFolders(webId, baseUrl + 'public/solidapp/');
  }

  function handleOpenNotes(notepad: NotepadModel) {
    setOpenNotes(!openNotes);
    setNotepad(notepad);
  }

  return <>
    <div className="columns">
      <div className="column has-text-right" style={{ marginTop: 40, marginRight: 20 }} >
        <LogoutButton className="button" />
      </div>
    </div>
    {!openNotes && <NotepadsList handleOpenNotes={handleOpenNotes} webId={webId as string} />}
    {openNotes && <NotesList webId={webId as string} notepad={notepad as NotepadModel} /> }
    {openNotes && <section className="section"><button className="backToNotepadsBtn" onClick={(e)=> setOpenNotes(false)}>Back to notepads</button></section>}
  </>;
};
