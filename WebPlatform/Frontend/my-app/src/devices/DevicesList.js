import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';


export default class DevicePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            deviceData: { id: '', name: '',regDate: '', place: '', type: '', status: '' },
            Devices: [],
            registeredDevices: 0,
            isLoading: false,
            hoveredRow: null
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.registeredDevices !== prevState.registeredDevices) {
            this.props.onDevicesChange(this.state.registeredDevices);
        }
    }

    async componentDidMount() {
        this.setState({ isLoading: true });
        // const response = await fetch('/api/getAllRegisteredDevices', {
        //     method: 'GET',
        //     credentials: 'include', // Include cookies in the request
        //     mode : 'cors',
        // });
        const response = await fetch('http://localhost:9093/getAllRegisteredDevices', {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
            mode : 'cors',
        });
        const data = await response.json();
        const devices = JSON.parse(JSON.parse(data)).map(device => JSON.parse(device));
        this.setState({ Devices: devices , registeredDevices: devices.length, isLoading: false});
    }

    handleClickOpen = (device) => {
        this.props.history.push(`/devices/${device.id}`);
    };

    render() {
        return(
            <React.Fragment>
            <Title>Added Devices</Title>
            {this.state.isLoading && <CircularProgress />}
            {!this.state.isLoading && (
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>registration Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Place</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell align="right"><strong>Details</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.state.Devices.map((device, index) => (
                        <TableRow
                            key={device.id}
                            onMouseEnter={() => this.setState({ hoveredRow: index })}
                            onMouseLeave={() => this.setState({ hoveredRow: null })}
                            style={{ backgroundColor: this.state.hoveredRow === index ? '#f5f5f5' : 'inherit' }}
                        >
                            <TableCell>{device.name}</TableCell>
                            <TableCell>{device.regDate}</TableCell>
                            <TableCell>
                                {device.status}
                            </TableCell>
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
            )}
            
        </React.Fragment>
        );
}
}
  

