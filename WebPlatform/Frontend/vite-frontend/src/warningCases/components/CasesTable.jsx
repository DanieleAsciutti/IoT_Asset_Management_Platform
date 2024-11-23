import Typography from "@mui/material/Typography";
import React, {useEffect, useState} from "react";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import {IconButton, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight.js";


const CasesTable = ({ cases, hoveredRow, handleRowHover, handleRowLeave, handleOpenDetails, isProcessed }) => {

    const [combinedCases, setCombinedCases] = useState([]); // [anomaly, RUL]

    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };

    const makeDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('it-IT', options).replace(',','');
    }

    useEffect(() => {
        // Check if cases is an object with the required properties
        if (cases && cases.anomalyWarningDTOList && cases.rulWarningDTOList) {
            const anomalyList = cases.anomalyWarningDTOList.map(item => ({
                ...item,
                type: "Anomaly"
            }));

            const rulList = cases.rulWarningDTOList.map(item => ({
                ...item,
                type: "RUL"
            }));

            const combinedList = [...anomalyList, ...rulList].sort((a, b) => {
                // Decide the sorting key based on isProcessed
                const dateKey = isProcessed ? 'processed_date_time' : 'creationDateTime';

                // Perform the sort
                return new Date(b[dateKey]) - new Date(a[dateKey]);
            });

            setCombinedCases(combinedList);
        }
    }, [cases]);

    if(combinedCases.length === 0) {
        return (
            <Typography variant="h6" color="textSecondary" align="center" sx={{ my: 2 }}>
                {isProcessed? "No processed cases available." : "No warning cases available."}
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
                        <TableCell><strong>Case Type</strong></TableCell>
                        <TableCell><strong>{isProcessed? "Processed Date": "Creation Date" }</strong></TableCell>
                        <TableCell><strong>Assigned to</strong></TableCell>
                        <TableCell align="right"><strong>Details</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {combinedCases.map((warnCase, index) => (
                        <TableRow
                            key={`${warnCase.id}-${index}`}
                            onMouseEnter={() => handleRowHover(index)}
                            onMouseLeave={handleRowLeave}
                            style={{ backgroundColor: hoveredRow === index ? '#f5f5f5' : 'inherit' }}
                        >
                            <TableCell>{warnCase.caseTitle}</TableCell>
                            <TableCell>{warnCase.deviceId.split(':')[2]}</TableCell>
                            <TableCell>{warnCase.deviceName}</TableCell>
                            <TableCell>{warnCase.type}</TableCell>
                            <TableCell>{isProcessed?  makeDate( warnCase.processed_date_time) : makeDate(warnCase.creationDateTime)}</TableCell>
                            <TableCell>{warnCase.assignedTo ? warnCase.assignedTo : 'None'}</TableCell>
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