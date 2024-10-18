import React from 'react';
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';

const ManageModels = ({
                          deviceData,
                          modelHistory,
                          getModel,
                          loadNewModel,
                          downloadModel
    }) => {

    const [currentModel, pendingRetrieve, pendingModel] = deviceData;

    return (
        <Box sx={{ maxWidth: '100%', p: 2 }}>
            {/* Title */}
            <Typography variant="h4" component="h1" gutterBottom>
                ML Model
            </Typography>

            {/* Current Model Section */}
            {currentModel ? (
                <Box>
                    {/* Current Model Information */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" color="textSecondary">
                            <strong>Current Model:</strong> {currentModel}
                        </Typography>

                        <Box ml={2}>
                            {!pendingRetrieve ? (
                                <Button variant="contained" color="primary" onClick={getModel}>
                                    Get Latest Version of Current Model
                                </Button>
                            ) : (
                                <Typography variant="body1" color="error">
                                    Pending current model requested
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Upload New Model Button */}
                    {!pendingModel ? (
                        <Button variant="contained" color="primary" onClick={loadNewModel} sx={{ mb: 2 }}>
                            Upload New Model
                        </Button>
                    ) : (
                        <Box>
                            <Typography variant="body1" color="textSecondary">
                                <strong>Pending Model:</strong> {pendingModel}
                            </Typography>
                        </Box>
                    )}

                    {/* Model History Section */}
                    {modelHistory.length > 0 ? (
                        <Box mt={2}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Model Name</TableCell>
                                            <TableCell>Creation Date</TableCell>
                                            <TableCell>From</TableCell>
                                            <TableCell>Download</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {modelHistory.map((model) => (
                                            <TableRow key={model.modelname}>
                                                <TableCell>{model.modelname}</TableCell>
                                                <TableCell>{model.creationDate}</TableCell>
                                                <TableCell>{model.from}</TableCell>
                                                <TableCell>
                                                    <Button variant="contained" color="primary" onClick={() => downloadModel(model.modelname)}>
                                                        Download
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    ) : (
                        <Typography variant="body1" color="error">
                            No model history available
                        </Typography>
                    )}
                </Box>
            ) : (
                <Box>
                    {/* No Current Model */}
                    <Typography variant="h6" color="error">
                        Device does not have a current model
                    </Typography>

                    {/* Upload New Model if no current model */}
                    {!pendingModel ? (
                        <Button variant="contained" color="primary" onClick={loadNewModel}>
                            Upload New Model
                        </Button>
                    ) : (
                        <Box>
                            <Typography variant="body1" color="textSecondary">
                                <strong>Pending Model:</strong> {pendingModel}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default ManageModels;
