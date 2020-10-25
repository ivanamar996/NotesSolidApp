import React from 'react';
import './../../App.scss';

interface Props {
    onSave: (title: string) => Promise<void>;
};

export const NewNotepad: React.FC<Props> = (props) => {

    const [notepodTitle, setNotepodTitle] = React.useState('');

    async function saveNotepod() {
        await props.onSave(notepodTitle);
        setNotepodTitle('');
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            saveNotepod();
        }
    }

    return <>
        <form onSubmit={saveNotepod}>
            <div className="field">
                <div className="control">
                    <input type="text"
                        id="notepadTitleID"
                        className="input divShadow"
                        style={{ marginLeft: 450, width: 600 }}
                        value={notepodTitle}
                        onChange={(e) => { e.preventDefault(); setNotepodTitle(e.target.value); }}
                        onKeyDown={handleKeyDown}
                        placeholder="New notepads...."
                    />
                </div>
            </div>
        </form>
    </>
};