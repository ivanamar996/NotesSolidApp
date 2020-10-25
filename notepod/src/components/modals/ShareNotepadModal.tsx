import React, { useEffect } from "react";
import Utils from '../../services/Utils';
import AclUtils from '../../services/aclUtils';
import SolidBackend from '../../services/SolidBackend';
import { Grid } from "@material-ui/core";
import '../../App.scss';

const ShareNotepadModal = (props: any) => {

    const [coworkersUrl, setCoworkersUrl] = React.useState<string[]>([]);
    const [coworkerUrl, setCoworkerUrl] = React.useState('');


    if(coworkersUrl.length == 0){
        getCoworkers().then(function (parsedData) {
            if(parsedData.length > 0)
                setCoworkersUrl(parsedData);
        });
    }


    async function getCoworkers() {
        return await AclUtils.getCoworkers(props.notepad.url, props.notepad.creator);
    }

    async function deleteCoworker(coworkerUrl: string) {
        await AclUtils.deleteCoworker(props.notepad.url, coworkerUrl);
    }

    const updateNotepad: React.FormEventHandler = async (event) => {
        event.preventDefault();
        props.handleClose();
        await AclUtils.addCoworkers(props.notepad.url, coworkersUrl);
        props.notepad.coworkers = coworkersUrl;
        await SolidBackend.updateNotepad(props.notepad);
        setCoworkersUrl([]);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            setCoworkersUrl(array => [...array, coworkerUrl]);
            setCoworkerUrl('');
        }
    }

    const coworkers = coworkersUrl.map((coworker: string, index) => (
        <Grid container spacing={2} key={index}>
            <Grid className="d-flex" key={index} style={{ marginTop: 10, marginLeft: 9 }}>
                <input type="text"
                 key={index}
                    className="input"
                    style={{ width: 540 }}
                    value={coworker}
                    disabled={true}
                />
                <button onClick={(e) => {
                    e.preventDefault();
                    deleteCoworker(coworker);
                    var npom = [...coworkersUrl];
                    npom.splice(index, 1); setCoworkersUrl(npom)
                }
                }
                    className="Xbtn"
                >X</button>
            </Grid>
        </Grid>

    ));

    return (
        <div className="popup-box">
            <div className="box">
                <form onSubmit={updateNotepad} className="content">
                    <label style={{ fontWeight: 'bold' }}>Coworkers</label>
                    <hr></hr>
                    <div className="field">
                        <div className="control">
                            <input type="text"
                                className="input"
                                value={Utils.getBaseUrl(props.notepad.creator) + ' - owner'}
                                disabled={true}
                            />
                            {coworkers}
                            <input type="text"
                                className="input"
                                value={coworkerUrl}
                                style={{ marginTop: 15 }}
                                onChange={(e) => { e.preventDefault(); setCoworkerUrl(e.target.value); }}
                                onKeyDown={handleKeyDown}
                            />
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

export default ShareNotepadModal;