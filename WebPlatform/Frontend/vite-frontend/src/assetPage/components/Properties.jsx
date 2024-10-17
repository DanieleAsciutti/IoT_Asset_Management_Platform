import React, { useState } from 'react';
import { Grid, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';

const Properties = ({ deviceData, handleAddProperty }) => {
    // State to manage the dialog and input values
    const [dialogOpen, setDialogOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [value, setValue] = useState('');

    // Handle dialog open/close
    const handleDialogOpen = () => setDialogOpen(true);
    const handleDialogClose = () => setDialogOpen(false);

    // Handle input changes
    const handleLabelChange = (event) => setLabel(event.target.value);
    const handleValueChange = (event) => setValue(event.target.value);

    // Submit new property
    const handleSubmit = () => {
        handleAddProperty(label, value); // Call the parent function to add the property
        setDialogOpen(false); // Close the dialog
        setLabel(''); // Clear the label input
        setValue(''); // Clear the value input
    };

    return (
        <Grid item xs={12} md={6} sx={{ p: 2 }}>
            <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                    <h2>Properties</h2>

                    {/* Table to display properties */}
                    <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
                        <Table sx={{ border: '4px solid #2196f3' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(deviceData.asset.properties).map(key => (
                                    <TableRow key={key}>
                                        <TableCell>{key}</TableCell>
                                        <TableCell>{deviceData.asset.properties[key].toString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>

                    {/* Button to add properties */}
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleDialogOpen} sx={{ width: '100%' }}>
                            Add properties
                        </Button>
                    </Box>

                    {/* Dialog for adding properties */}
                    <Dialog open={dialogOpen} onClose={handleDialogClose}>
                        <DialogTitle>Add properties</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="label"
                                label="Label"
                                type="text"
                                fullWidth
                                value={label}
                                onChange={handleLabelChange}
                            />
                            <TextField
                                margin="dense"
                                id="value"
                                label="Value"
                                type="text"
                                fullWidth
                                value={value}
                                onChange={handleValueChange}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDialogClose} color="primary">
                                Back
                            </Button>
                            <Button onClick={handleSubmit} color="primary">
                                Add
                            </Button>
                        </DialogActions>
                    </Dialog>

                </Grid>
            </Grid>
        </Grid>
    );
};

export default Properties;
