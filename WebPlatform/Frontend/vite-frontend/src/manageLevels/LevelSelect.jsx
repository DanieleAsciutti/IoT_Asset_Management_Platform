import React, {useState} from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import Button from "@mui/material/Button";


/**
 *
 * @param label can be Level1, Level2, Level3
 * @param value the current value of the level
 * @param levelOptions the available options for the level
 * @param setLevel function to update the level value
 */
const LevelSelect = ({ label, value, levelOptions, setLevel }) => {

    const [openDialogue, setOpenDialogue] = useState(false);
    const [newLevelValue, setNewLevelValue] = useState('');
    const [currValue, setCurrValue] = useState(value);

    const handleOpenDialogue = () => {
        setOpenDialogue(true);
    }

    const handleCloseDialogue = () => {
        setOpenDialogue(false);
    }

    const handleAddNewLevel = () => {
        setCurrValue(newLevelValue);
        levelOptions.push(newLevelValue);
        setLevel(newLevelValue);
        setNewLevelValue('');
        handleCloseDialogue();
    }

    const handleValueChange = (e) => {
        setCurrValue(e.target.value);
        setLevel(e.target.value);
    }

    return (
        <>
            {/* Level Selection Component */}
            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id={`${label}-label`}>{label}</InputLabel>
                <Select
                    labelId={`${label}-label`}
                    value={currValue}
                    onChange={(e) => {
                        if (e.target.value === 'new') {
                            handleOpenDialogue(); // Open dialog for adding a new level
                        } else {
                            handleValueChange(e); // Update level value
                        }
                    }}
                    label={label}
                >
                    {levelOptions.map((option, index) => (
                        <MenuItem key={index} value={option}>{option}</MenuItem>
                    ))}
                    <MenuItem value="new">+ Add New {label}</MenuItem>
                </Select>
            </FormControl>

                {/* Dialog for Adding New Level */}
            <Dialog open={openDialogue} onClose={handleCloseDialogue}>
                <DialogTitle>Add New {label}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={`New ${label}`}
                        fullWidth
                        value={newLevelValue}
                        onChange={(e) => {
                            setNewLevelValue(e.target.value);   // Update state for new level value
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialogue}>Cancel</Button>
                    <Button onClick={handleAddNewLevel} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
    </>
    );
};

export default LevelSelect;