import Typography from "@mui/material/Typography";
import React from "react";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import {IconButton, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight.js";


const CasesTable = ({ cases, hoveredRow, handleRowHover, handleRowLeave, handleOpenDetails }) => {

    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const makeDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('it-IT', options).replace(',','');
    }

    if(cases.length === 0) {
        return (
            <Typography variant="h6" color="textSecondary" align="center" sx={{ my: 2 }}>
                No warning cases available.
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Case Title</strong></TableCell>
                        <TableCell><strong>DeviceId</strong></TableCell>
                        <TableCell><strong>Device Name</strong></TableCell>
                        <TableCell><strong>Creation Date</strong></TableCell>
                        {/*<TableCell><strong>Place</strong></TableCell>*/}
                        <TableCell align="right"><strong>Details</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {cases.map((warnCase, index) => (
                        <TableRow
                            key={warnCase.id}
                            onMouseEnter={() => handleRowHover(index)}
                            onMouseLeave={handleRowLeave}
                            style={{ backgroundColor: hoveredRow === index ? '#f5f5f5' : 'inherit' }}
                        >
                            <TableCell>{warnCase.caseTitle}</TableCell>
                            <TableCell>{warnCase.deviceId.split(':')[2]}</TableCell>
                            <TableCell>{warnCase.deviceName}</TableCell>
                            <TableCell>{makeDate(warnCase.timestamp)}</TableCell>
                            <TableCell align="right">
                                <IconButton color="primary"  onClick={() => handleOpenDetails(warnCase)} >
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

export default CasesTable;