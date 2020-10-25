import React from 'react';

interface Props {
    searchNotes: (criteria: string) => void;
    cancelSearchNote: () => void;
};

export const SearchNotes: React.FC<Props> = (props) => {

    const [searchCriteria, setSearchCriteria] = React.useState('');

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            props.searchNotes(searchCriteria);
        }
    }

    const cancelSearchNote = ():void => {
        setSearchCriteria('');
        props.cancelSearchNote();
    }

    return <>
        <form>
            <div className="field">
                <div className="control">
                    <input type="text"
                        id="notepadTitleID"
                        className="input divShadow"
                        style={{ marginLeft: 350, width: 800 , marginTop:-80}}
                        value={searchCriteria}
                        onChange={(e) => { e.preventDefault(); setSearchCriteria(e.target.value); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search notes...."
                    />
                    { searchCriteria!='' &&
                        <div className="control" style={{marginTop:-104}}>
                         <button className="searchXBtn" onClick={cancelSearchNote}>X</button>
                       </div>
                    }
                </div>
            </div>
        </form>
    </>
};