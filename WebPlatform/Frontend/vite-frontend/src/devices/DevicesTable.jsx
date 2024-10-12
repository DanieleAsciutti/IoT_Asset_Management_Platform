import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, IconButton } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Link as RouterLink } from 'react-router-dom';
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

const DevicesTable = ({ devices, hoveredRow, handleRowHover, handleRowLeave }) => {
    if (devices.length === 0) {
        return (
            <Typography variant="h6" color="textSecondary" align="center" sx={{ my: 2 }}>
                There are no devices with these attributes.
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Registration Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Place</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell align="right"><strong>Details</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {devices.map((device, index) => (
                        <TableRow
                            key={device.id}
                            onMouseEnter={() => handleRowHover(index)}
                            onMouseLeave={handleRowLeave}
                            style={{ backgroundColor: hoveredRow === index ? '#f5f5f5' : 'inherit' }}
                        >
                            <TableCell>{device.name}</TableCell>
                            <TableCell>{device.regDate}</TableCell>
                            <TableCell>{device.status}</TableCell>
                            <TableCell>{device.place}</TableCell>
                            <TableCell>{device.type}</TableCell>
                            <TableCell align="right">
                                <IconButton color="primary" component={RouterLink} to={`/devices/${device.id}`}>
                                    <KeyboardArrowRightIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DevicesTable;
