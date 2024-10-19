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
import {toast, ToastContainer} from "react-toastify";


/**
 *
 * @param label can be Level1, Level2, Level3
 * @param value the current value of the level
 * @param levelOptions the available options for the level
 * @param setLevel function to update the level value
 * @param undisable flag to disable the level selection, if is true
 */
const LevelSelect = ({ label, value, levelOptions, setLevel, undisable }) => {

    const [openDialogue, setOpenDialogue] = useState(false);
    const [newLevelValue, setNewLevelValue] = useState('');
    const [currValue, setCurrValue] = useState(value);

    const handleOpenDialogue = () => {
        setOpenDialogue(true);
    }

    const handleCloseDialogue = () => {
        setNewLevelValue('');
        setOpenDialogue(false);
    }

    const handleAddNewLevel = () => {
        if(newLevelValue === '') {
            toast.error('Can\'t insert an empty value');
            return;
        }
        setCurrValue(newLevelValue);
        if(!levelOptions.includes(newLevelValue)){
            levelOptions.push(newLevelValue);
        }
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
                    disabled={!undisable}
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
                    <Button onClick={handleCloseDialogue} variant={"contained"}>Cancel</Button>
                    <Button onClick={handleAddNewLevel} color="primary" variant={"contained"}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover={false}
            />
    </>
    );
};

export default LevelSelect;