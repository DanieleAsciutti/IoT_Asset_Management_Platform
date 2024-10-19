import React, {useEffect, useState} from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box } from '@mui/material';
import Typography from "@mui/material/Typography";
import LevelSelect from "../../manageLevels/LevelSelect.jsx";

const TagButton = ({currTag, addTag}) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tag, setTag] = useState(currTag || '');
    const [newTag, setNewTag] = useState('');
    const [tagOptions, setTagOptions] = useState([]);

    useEffect(() => {
        if (currTag !== null) {
            setTag(currTag); // Update tag only when currTag changes
        } else {
            setTag(''); // Reset the tag if currTag is null
        }
    }, [currTag]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch(`/api/getAllDeviceTags`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setTagOptions(data);
                } else {
                    console.log("Failed to fetch tag options");
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        fetchTags();
    }, [dialogOpen]);


    const handleDialogOpen = () => {
        setNewTag(tag);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleTagChange = (event) => {
        setNewTag(event);
    };

    const handleSubmit = (del) => {
        // Submit tag logic
        if(del){
            setTag(''); // Reset tag if delete is true
            addTag(null);
        }else{
            setTag(newTag);
            addTag(newTag);
        }
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
                    <LevelSelect label={'Tag'} value={newTag} levelOptions={tagOptions} setLevel={handleTagChange} undisable={true}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary" variant="contained">
                        Back
                    </Button>
                    <Button onClick={() => handleSubmit(true)} color="primary" variant="contained">
                        Delete
                    </Button>
                    <Button onClick={() => handleSubmit(false)} color="primary" variant="contained" >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>


        </Box>
    );
};

export default TagButton;
