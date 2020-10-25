import React from "react";
import moment from 'moment';
import SolidBackend from "../../services/SolidBackend";

const NotepadEditModal = (props: any) => {

  const [title, setTitle] = React.useState(props.notepad.title);

  const saveNotepad: React.FormEventHandler = async (event) => {
    event.preventDefault();
    props.notepad.title  = title;
    await SolidBackend.updateNotepad(props.notepad);
    props.handleClose();
  };

  return (
    <div className="popup-box">
      <div className="box">
        <form onSubmit={saveNotepad} className="content">
          <hr></hr>
          <div className="field">
            <div className="control">
              <input type="text"
                className="input"
                value={title}
                onChange={(e) => { e.preventDefault(); setTitle(e.target.value); }}
              />
              <div className="has-text-right">
               <p style={{marginTop:20, fontStyle:'italic'}}>Modified at: {moment(props.notepad.createdAt).format('DD/MM/YYYY')}</p>
              </div>
            </div>
          </div>
          <hr></hr>
          <div className="flex-box-2">
            <button className="transparentBtn" style={{marginRight:40}} onClick={props.handleClose}> Cancel </button>
            <button className="transparentBtn" style={{marginRight:20}} type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotepadEditModal;