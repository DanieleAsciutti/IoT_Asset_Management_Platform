import React, {useState} from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

const NodeTable = ({assets}) => {
    const [hoveredRow, setHoveredRow] = useState(null);

    const handleRowHover = (index) => {
        setHoveredRow(index);
    };

    const handleRowLeave = () => {
        setHoveredRow(null);
    };




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
            <Table size="medium">
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
                    {assets.map((asset, index) => (
                        <TableRow
                            key={index}
                            onMouseEnter={() => handleRowHover(index)}
                            onMouseLeave={handleRowLeave}
                            style={{ backgroundColor: hoveredRow === index ? '#f5f5f5' : 'inherit' }}
                        >
                            <TableCell>{asset.label}</TableCell>
                            <TableCell align="right">{asset.count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );


};

export default NodeTable;