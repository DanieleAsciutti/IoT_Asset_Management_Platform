import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';
import LevelSelect from "./LevelSelect.jsx";


const ModifyLevelsDialogue = ({ open, onClose, levels , levelOptionsList, modifyLevels}) => {

    const [openDialog, setOpenDialog] = useState(false);
    const [levelDialog, setLevelDialog] = useState('');

    const [levelOptions, setLevelOptions] = useState([]);
    const [currentLevel, setCurrentLevel] = useState('');

    // Destructure the levels (level1, level2, level3) from props
    const {level1, level2, level3} = levels;
    const {level1Options, level2Options, level3Options} = levelOptionsList;


    // State to hold the new level value
    const [newLevel, setNewLevel] = useState(currentLevel);

    // Function to handle the new level change
    const handleLevelChange = (level) => {
        setNewLevel(level);
    };

    const handleModifyLevels = () => {
        modifyLevels(levelDialog, level1, level2, level3, newLevel);
        handleCloseDialog();
    }

    const handleOpenDialog = (level) => {
        setLevelDialog(level);
        switch (level) {
            case 'Level1':
                setLevelOptions(level1Options);
                setCurrentLevel(level1);
                break;
            case 'Level2':
                setLevelOptions(level2Options);
                setCurrentLevel(level2);
                break;
            case 'Level3':
                setLevelOptions(level3Options);
                setCurrentLevel(level3);
                break;
            default:
                break;
        }
        setOpenDialog(true);
    }

    const handleCloseDialog = () => {
        setLevelDialog('');
        setNewLevel('');
        setOpenDialog(false);
    }


    return (
        <div>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>Modify Levels</DialogTitle>

                <DialogContent>
                    {/* Display the current levels */}
                    <Typography variant="body1">
                        Levels Information:
                    </Typography>
                    <Box sx={{mt: 2}}>
                        <Typography>Level 1 = {level1 || 'Not Set'}</Typography>
                        {level2 && (<Typography>Level 2 = {level2}</Typography>)}
                        {level3 && (<Typography>Level 3 = {level3}</Typography>)}
                    </Box>
                </DialogContent>

                <DialogActions>
                    {/* Close Button */}
                    <Button
                        onClick={onClose}
                        variant="contained"
                        color="primary"
                    >
                        Close
                    </Button>

                    {level1 && (
                        <Button
                            onClick={() => handleOpenDialog('Level1')}
                            variant="contained"
                            color="primary"
                        >
                            Modify Level 1
                        </Button>
                    )}
                    {level2 && (
                        <Button
                            onClick={() => handleOpenDialog('Level2')}
                            variant="contained"
                            color="primary"
                        >
                            Modify Level 2
                        </Button>
                    )}
                    {level3 && (
                        <Button
                            onClick={() => handleOpenDialog('Level3')}
                            variant="contained"
                            color="primary"
                        >
                            Modify Level 3
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{`Modify ${levelDialog}`}</DialogTitle>
                <DialogContent>
                    <LevelSelect label={levelDialog} value={currentLevel} levelOptions={levelOptions} setLevel={handleLevelChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary" variant="contained">Close</Button>
                    <Button onClick={handleModifyLevels} color="secondary" variant="contained">Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ModifyLevelsDialogue;