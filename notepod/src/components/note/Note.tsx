import React from 'react';
import NoteModel from '../../models/Note';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import NoteEditModal from '../modals/NoteEditModal';

interface Props {
    note: NoteModel;
    deleteNote:(note:NoteModel)=>void;
};

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

export const Note: React.FC<Props> = (props) => {

    const [isOpenEdit, setIsOpenEdit] = React.useState(false);

    const togglePopupEdit = () => {
        setIsOpenEdit(!isOpenEdit);
    }

    function deleteNote(){
        props.deleteNote(props.note);
    }

    const classes = useStyles();

    const tagsElement = props.note.tags.map((tag: string, index: number) => {

        if (tag.length > 0) {
            return <div className="divTags">
                <p className="tagClass" >{tag}</p>
            </div>
        }
    });

    return <>
        {isOpenEdit && <NoteEditModal note={props.note} handleClose={togglePopupEdit} />}
        <Card className={classes.root}>
            <div onClick={togglePopupEdit}>
                <CardContent>
                    <Typography variant="h5" component="h2">
                        {props.note.title}
                    </Typography>
                    <div className="field">
                        <div className="control">
                            <textarea
                                className="form-control input"
                                value={props.note.content}
                                disabled={true}
                                style={{ height: 100 }}
                            />
                        </div>
                        <div className="control" style={{ marginTop: 10 }}>
                            {tagsElement}
                        </div>
                    </div>
                </CardContent>
            </div>
            <CardActions>
                <button className="cardBtn" style={{ marginLeft: 280 }} onClick={deleteNote}>DELETE</button>
            </CardActions>
        </Card>

    </>;
}

