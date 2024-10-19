import React, { useState } from 'react';
import { Grid, Box, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

const AssetDescription = ({assetDescription, addDescription }) => {

    // State for Dialog and description input
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newDescription, setNewDescription] = useState(assetDescription || '');

    // Handle Dialog open/close
    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setNewDescription(assetDescription || '');  // Reset newDescription to original description
    };

    // Handle Description Change
    const handleDescriptionChange = (e) => {
        setNewDescription(e.target.value);
    };

    // Submit action (either add/change or delete description)
    const handleSubmit = (deleteDescription) => {
        if (deleteDescription) {
            setNewDescription('');  // Clear out the description
            addDescription('');  // Call the parent's addDescription function
        }else{
            addDescription(newDescription);  // Call the parent's addDescription function
        }
        setDialogOpen(false);  // Close dialog
    };

    return (
        <Grid item xs={12}>
            <Box sx={{ maxWidth: '100%', maxHeight: '500px' }}>

                <Typography variant="body1" color="textSecondary">
                    <strong>Current Description:</strong> {assetDescription ? assetDescription : 'Description not set'}
                </Typography>

                <Button variant="contained" color="primary" onClick={handleDialogOpen} sx={{ width: '40%', mt: 2 }}>
                    {assetDescription ? 'Change Description' : 'Add Description'}
                </Button>

                {/* Dialog for Adding/Changing/Deleting Description */}
                <Dialog open={dialogOpen} onClose={handleDialogClose}>
                    <DialogTitle>{assetDescription ? 'Modify Description' : 'Add Description'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="description"
                            label="Description"
                            type="text"
                            fullWidth
                            value={newDescription}
                            onChange={handleDescriptionChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose} color="primary" variant={"contained"}>
                            Back
                        </Button>
                        <Button onClick={() => handleSubmit(false)} color="primary" variant={"contained"}>
                            {assetDescription ? 'Change' : 'Add'}
                        </Button>
                        {assetDescription && (
                            <Button onClick={() => handleSubmit(true)} color="primary" variant={"contained"}>
                                Delete
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
            </Box>
        </Grid>
    );
};

export default AssetDescription;
