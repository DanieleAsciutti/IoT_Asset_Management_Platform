import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import Box from "@mui/material/Box";
import Network from "../assetPage/components/DevGraph.jsx";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import * as React from "react";


const CaseDialogue = ({open, handleClose, selectedCase, processCase}) => {

    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const makeDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('it-IT', options).replace(',','');
    }


    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
                        <Typography variant="body1">
                            <Typography component="span" variant="body1" fontWeight="bold">Device ID:</Typography> {selectedCase.deviceId.split(':')[2]}
                        </Typography>
                        <Typography variant="body1">
                            <Typography component="span" variant="body1" fontWeight="bold">Device Name:</Typography> {selectedCase.deviceName}
                        </Typography>
                        <Typography variant="body1">
                            <Typography component="span" variant="body1" fontWeight="bold">Creation Date:</Typography> {makeDate(selectedCase.timestamp)}
                        </Typography>
                        <Typography variant="body1">
                            <Typography component="span" variant="body1" fontWeight="bold">Level 1:</Typography> {selectedCase.level1}
                        </Typography>
                        <Typography variant="body1">
                            <Typography component="span" variant="body1" fontWeight="bold">Level 2:</Typography> {selectedCase.level2}
                        </Typography>
                        <Typography variant="body1">
                            <Typography component="span" variant="body1" fontWeight="bold">Level 3:</Typography> {selectedCase.level3}
                        </Typography>

                    </Box>
                </Box>
            </DialogContent>

            {/* Dialog Actions: Close and Process Buttons */}
            <DialogActions>
                <Button onClick={handleClose} color="primary" variant="contained">
                    Close
                </Button>
                <Button onClick={processCase} color="secondary" variant="contained">
                    Process
                </Button>
            </DialogActions>
        </Dialog>
    )
};

export default CaseDialogue;