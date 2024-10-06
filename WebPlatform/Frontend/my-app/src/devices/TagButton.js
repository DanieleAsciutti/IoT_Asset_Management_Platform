import React, {useEffect, useState} from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box } from '@mui/material';
import Typography from "@mui/material/Typography";

const TagButton = ({currTag, addTag}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tag, setTag] = useState(currTag || '');
    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (currTag !== null) {
            setTag(currTag); // Update tag only when currTag changes
        } else {
            setTag(''); // Reset the tag if currTag is null
        }
        console.log('currTag:', currTag)
    }, [currTag]);

    const handleDialogOpen = () => {
        setNewTag(tag);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleTagChange = (event) => {
        setNewTag(event.target.value);
    };

    const handleSubmit = (del) => {
        // Submit tag logic
        console.log(del);
        if(del){
            setTag(''); // Reset tag if delete is true
            addTag(null);
        }else{
            setTag(newTag);
            addTag(newTag);
        }
        console.log('Tag submitted:', newTag);
        setNewTag('');
        setDialogOpen(false);
    };

    return (
        <Box sx={{
            maxWidth: '100%',
            maxHeight: '500px',
        }}>
            <h1>Device Tag</h1>

            <Typography variant="body1" color="textSecondary">
                <strong>Current Tag:</strong> {tag ? tag : 'Tag currently not set'}
            </Typography>

            <Button variant="contained" color="primary" onClick={handleDialogOpen} sx={{ width: '17%' }}>
                Add a Tag
            </Button>

            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Add or Modify the Tag</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="tag"
                        label="Tag"
                        type="text"
                        fullWidth
                        value={newTag}
                        onChange={handleTagChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Back
                    </Button>
                    <Button onClick={() => handleSubmit(false)} color="primary">
                        Add
                    </Button>
                    <Button onClick={() => handleSubmit(true)} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TagButton;
