import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// Generate Device Data
function createDevice(id, name, date, status, lastModified) {
    return { id, name, date, status, lastModified };
}

// DA OTTENERE DINAMICAMENTE

const devices = [
    createDevice(0, 'SmartTherm', '2024-04-25', 'Connected', '2024-04-25'),
    createDevice(1, 'EnviroSense', '2024-04-24', 'Disconnected', '2024-04-24'),
    createDevice(2, 'HumidityTracker', '2024-04-23', 'Connected', '2024-04-23'),
    createDevice(3, 'SolarGuard', '2024-04-22', 'Connected', '2024-04-22'),
    createDevice(4, 'SmartMeter', '2024-04-21', 'Disconnected', '2024-04-21'),
];

function preventDefault() {
    console.info('You clicked a link.');
}

export default function Devices() {
    const [hoveredRow, setHoveredRow] = React.useState(null);

    return (
        <React.Fragment>
            <Title>Recent Devices Added</Title>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Last Modified</strong></TableCell>
                        <TableCell align="right"><strong>Details</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {devices.map((device, index) => (
                        <TableRow
                            key={device.id}
                            onMouseEnter={() => setHoveredRow(index)}
                            onMouseLeave={() => setHoveredRow(null)}
                            style={{ backgroundColor: hoveredRow === index ? '#f5f5f5' : 'inherit' }}
                        >
                            <TableCell>{device.name}</TableCell>
                            <TableCell>{device.date}</TableCell>
                            <TableCell>
                                <span style={{ color: device.status === 'Connected' ? 'green' : 'red' }}>●</span>
                            </TableCell>
                            <TableCell>{device.lastModified}</TableCell>
                            <TableCell align="right">
                                <Link color="primary" href={`/devices/${device.id}`}>
                                    <KeyboardArrowRightIcon />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Link color="primary" href="/devices/" onClick={preventDefault} sx={{ mt: 3 }}>
                See more devices
            </Link>
        </React.Fragment>
    );
}
