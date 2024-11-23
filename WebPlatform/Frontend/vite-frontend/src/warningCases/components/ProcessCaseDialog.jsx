import React, { useState } from 'react';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControlLabel, Radio, RadioGroup,
} from '@mui/material';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const ProcessCaseDialog = ({ openDialog, handleCloseDialog, selectedCase, handleProcess }) => {
    const [isCorrect, setIsCorrect] = useState(true);
    const [explanation, setExplanation] = useState('');
    const [note, setNote] = useState('');

    const handleProcessCase = () => {
        // Prepare data for assignment
        const assignmentData = {
            isCorrect,
            explanation: isCorrect ? null : explanation,
            note,
        };

        // Call the provided handleAssign function with the assignment data
        handleProcess(assignmentData);
        handleCloseDialog(); // Close dialog after assignment
    };

    const isAnomaly = selectedCase.type === 'Anomaly';

    return (
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
            <DialogTitle fontWeight="bold">Close Case</DialogTitle>
            <DialogContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="body1" style={{ marginRight: '10px' }}>
                        {isAnomaly ? 'Is the Anomaly correct?' : 'Is the RUL correct?'}
                    </Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isCorrect === true}
                                onChange={() => {
                                    setIsCorrect(true);
                                    setExplanation(''); // Clear explanation if marked correct
                                }}
                                color="primary"
                            />
                        }
                        label="True"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isCorrect === false}
                                onChange={() => {
                                    setIsCorrect(false);
                                }}
                                color="primary"
                            />
                        }
                        label="False"
                    />
                </Box>
                {isCorrect === false && (
                    <TextField
                        margin="dense"
                        label={isAnomaly ? "Reason why it wasn't an anomaly" : "Correct RUL"}
                        type="text"
                        fullWidth
                        multiline
                        rows={4} // Set the number of visible rows
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                    />
                )}
                <TextField
                    margin="dense"
                    label="Additional Note"
                    type="text"
                    fullWidth
                    multiline
                    rows={4} // Set the number of visible rows
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog} color="primary" variant="contained">
                    Cancel
                </Button>
                <Button onClick={handleProcessCase} color="secondary" variant="contained">
                    Close Case
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProcessCaseDialog;
