import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import Box from "@mui/material/Box";
import Network from "../../assetPage/components/DevGraph.jsx";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import React, { useState } from 'react';
import TextField from "@mui/material/TextField";
import ProcessCaseDialog from "./ProcessCaseDialog.jsx";


const CaseDialogue = ({open, handleCloseDialog, selectedCase, assignCase, closeCase, isProcessed, handleDeleteCase}) => {

    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [assignTo, setAssignTo] = useState('');

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [openProcessCaseDialog, setOpenProcessCaseDialog] = useState(false);

    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const makeDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('it-IT', options).replace(',','');
    }

    const handleOpenAssignDialog = () => {
        setOpenAssignDialog(true);
        setAssignTo(''); // Clear input when opening the dialog
    };
    const handleCloseAssignDialog = () => {
        setOpenAssignDialog(false);
        setAssignTo(''); // Clear input when closing the dialog
    };

    const handleAssignCase = () => {
        assignCase(assignTo);
        handleCloseAssignDialog();
    }


    const handleOpenProcessCaseDialog = () => {
        setOpenProcessCaseDialog(true);
    }

    const handleCloseProcessCaseDialog = () => {
        setOpenProcessCaseDialog(false);
    }

    const handleProcessCase = (data) => {
        closeCase(data);
        handleCloseProcessCaseDialog();
        handleCloseDialog();
    }

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    }
    const handleConfirmDelete = () => {
        handleCloseDeleteDialog();
        handleDeleteCase();
        handleCloseDialog();
    }


    return (
        <box>
            <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle fontWeight="bold">Case Details</DialogTitle>
                <DialogContent>
                    {/* Wrapper Box for the two sections */}
                    <Box display="flex" flexDirection="row" gap={2}>
                        {/* Left: Network Component */}
                        <Box
                            flex={1} // To allow flexible resizing
                            border="4px solid #2196f3"
                            maxWidth='100%'
                            maxHeight="500px"
                            // overflow="auto"
                        >
                            {/*<Box width="100%" height="100%" overflow="auto">*/}
                            <Box maxWidth='100%' maxHeight='100%' overflow="hidden">
                                <Network
                                    id={selectedCase.deviceId}
                                    l1={selectedCase.level1}
                                    l2={selectedCase.level2}
                                    l3={selectedCase.level3}
                                    nodesClickable={false}
                                    style={{
                                        width: '70%',
                                        height: '70%',
                                        overflow: 'hidden',
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Right: Information */}
                        <Box
                            flex={1} // Allows this part to take equal space as the Network component
                            display="flex"
                            flexDirection="column"
                            justifyContent="flex-start"
                        >
                            {[
                                { label: 'Device ID:', value: selectedCase.deviceId.split(':')[2] },
                                { label: 'Device Name:', value: selectedCase.deviceName },
                                { label: 'Creation Date:', value: makeDate(selectedCase.creationDateTime) },
                                isProcessed && { label: 'Processed Date:', value: makeDate(selectedCase.processed_date_time) },
                                { label: 'Level 1:', value: selectedCase.level1 },
                                { label: 'Level 2:', value: selectedCase.level2 },
                                { label: 'Level 3:', value: selectedCase.level3 },
                                { label: 'Assigned to:', value: selectedCase.assignedTo || 'None' },
                                selectedCase.type === "Anomaly" &&
                                    {label: 'Anomaly Description:', value: selectedCase.anomaly_description},
                                selectedCase.type === "RUL" && {
                                    label: 'Device RUL:', value: selectedCase.device_rlu},
                                ...(isProcessed ? [
                                    { label: 'Warning Correct:', value: selectedCase.is_warning_correct ? 'Yes' : 'No'},
                                    !selectedCase.is_warning_correct && { label: 'Technician Description', value: selectedCase.technician_description},
                                    { label: 'Note:' , value: selectedCase.note},
                                ] : [])
                            ].filter(Boolean).map(({ label, value }, index) => (
                                <Typography variant="body1" key={index}>
                                    <Typography component="span" variant="body1" fontWeight="bold">{label}</Typography> {value}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                </DialogContent>

                {/* Dialog Actions: Back and Process Buttons */}
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary" variant="contained">
                        Back
                    </Button>
                    {!isProcessed ? (
                        selectedCase.assignedTo ? (
                            <Button onClick={handleOpenProcessCaseDialog} color="secondary" variant="contained">
                                Close case
                            </Button>
                        ) : (
                            <Button onClick={handleOpenAssignDialog} color="secondary" variant="contained">
                                Assign case
                            </Button>
                        )) : (
                        <Button onClick={() => setOpenDeleteDialog(true)} color="secondary" variant="contained">
                            Delete case
                        </Button>
                        )}
                </DialogActions>
            </Dialog>

            {/* Assign Dialog */}
            <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog}>
                <DialogTitle>Assign Case</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Enter Assignment Details"
                        type="text"
                        fullWidth
                        value={assignTo}
                        onChange={(e) => setAssignTo(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAssignDialog} color="primary" variant="contained">
                        Cancel
                    </Button>
                    <Button onClick={handleAssignCase} color="secondary" variant="contained">
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete the selected case?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        variant="contained"
                        color="primary"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="secondary"
                        variant="contained"
                    >
                        Confirm Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Process Case Dialog */}
            <ProcessCaseDialog openDialog={openProcessCaseDialog} handleCloseDialog={handleCloseProcessCaseDialog}
                    selectedCase={selectedCase} handleProcess={handleProcessCase}/>
        </box>
    )
};

export default CaseDialogue;