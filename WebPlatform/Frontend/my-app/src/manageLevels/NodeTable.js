import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

const NodeTable = ({assets}) => {
    const totalNodes = assets.reduce((sum, asset) => sum + asset.count, 0);

    if (assets.length === 0) {
        return (
            <Typography variant="h6" color="textSecondary" align="center" sx={{ my: 2 }}>
                No assets available.
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Label</strong></TableCell>
                        <TableCell align="right"><strong>Number of Nodes</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell><strong>Total Nodes</strong></TableCell>
                        <TableCell align="right"><strong>{totalNodes}</strong></TableCell>
                    </TableRow>
                    {assets.map((device, index) => (
                        <TableRow key={index}>
                            <TableCell>{device.label}</TableCell>
                            <TableCell align="right">{device.count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default NodeTable;