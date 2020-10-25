import React from 'react';
import '../../App.scss';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import NotepadEditModal from '../modals/NotepadEditModal';
import ShareNotepadModal from '../modals/ShareNotepadModal';
import NotepadModel from '../../models/Notepad';

const useStyles = makeStyles({
    root: {
        minWidth: 275,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
});

interface Props {
    notepad: NotepadModel;
    handleOpenNotes: (notepad:NotepadModel) => void;
};

export const Notepod: React.FC<Props> = (props) => {

    const [isOpen, setIsOpen] = React.useState(false);
    const [isOpenShareModal, setIsOpenShareModal] = React.useState(false);
 
    const togglePopup = () => {
      setIsOpen(!isOpen);
    }

    const toggleShareModal = () => {
        setIsOpenShareModal(!isOpenShareModal);
    }
    
    const toggleOpenNotes = () => {
        props.handleOpenNotes(props.notepad);
    }

    const classes = useStyles();

    return <>
        {isOpen && <NotepadEditModal notepad={props.notepad} handleClose={togglePopup}/>}
        {isOpenShareModal && <ShareNotepadModal notepad={props.notepad} handleClose={toggleShareModal}/>}
        <Card className={classes.root}>
            <div onClick={togglePopup}>
                <CardContent>
                    <Typography variant="h5" component="h2">
                        {props.notepad.title}
                    </Typography>
                </CardContent>
            </div>
            <CardActions>
                <button className="cardBtn" onClick={toggleShareModal}>SHARE NOTEPAD</button>
                <button className="cardBtn" onClick={toggleOpenNotes}> OPEN NOTES</button>
            </CardActions>
        </Card>
    </>;
}