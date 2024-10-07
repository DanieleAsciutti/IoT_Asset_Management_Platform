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
import SequentialFilter from "../components/SequentialFilter";
import DevicesTable from "./DevicesTable";

export default class DevicePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            deviceData: { id: '', name: '', regDate: '', place: '', type: '', status: '' },
            Devices: [],
            registeredDevices: 0,
            hoveredRow: null,
            level1: '',    // For filter
            level2: '',    // For filter
            level3: '',    // For filter
            level1Options: [],
            level2Options: [],
            level3Options: []
        };
    }

    componentDidUpdate(prevState) {
        if (this.state.registeredDevices !== prevState.registeredDevices) {
            this.props.onDevicesChange(this.state.registeredDevices);
        }
    }

    componentDidMount() {
        this.getLevel1Options();
    }

    // Fetch devices based on filter values
    fetchFilteredDevices = async (level1, level2, level3) => {
        // const response = await fetch(`http://localhost:9093/getFilteredRegisteredDevices?l1=${level1}&l2=${level2}&l3=${level3}`, {
        //     method: 'GET',
        //     credentials: 'include',
        //     mode: 'cors',
        // });
        const response = await fetch(`/api/getFilteredRegisteredDevices?l1=${level1}&l2=${level2}&l3=${level3}`, {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
        });

        const data = await response.json();
        if (data == null)
            return;


        const devices = data.map(deviceString => JSON.parse(deviceString));
        this.setState({ Devices: devices, registeredDevices: devices.length});
    };

    getLevel1Options = async () => {
        try {
            const response = await fetch('/api/getLevel1', {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });
            // const response = await fetch('http://localhost:9093/getLevel1', {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });

            if (response.ok) {
                const options = await response.json(); // Parse JSON response
                this.setState({ level1Options: options });
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    };

    getLevel2Options = async (level1) => {
        try {
            const response = await fetch(`/api/getLevel2?level1=${level1}`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });
            // const response = await fetch(`http://localhost:9093/getLevel2?level1=${level1}`, {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });

            if (response.ok) {
                const options = await response.json(); // Parse JSON response
                this.setState({ level2Options: options });
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    };

    getLevel3Options = async (level1, level2) => {
        try {
            const response = await fetch(`/api/getLevel3?level1=${level1}&level2=${level2}`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });
            // const response = await fetch(`http://localhost:9093/getLevel3?level1=${level1}&level2=${level2}`, {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });

            if (response.ok) {
                const options = await response.json(); // Parse JSON response
                this.setState({ level3Options: options })
                console.log('Level 3 options:', options)
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    }

    // Handlers for filter changes
    handleLevel1Change = (event) => {
        const level1 = event.target.value;
        this.setState({
            level1: level1,
            level2: '', // Reset Level 2 and Level 3 when Level 1 changes
            level3: '',
            level2Options: [], // Clear Level 2 options
            level3Options: [] // Clear Level 3 options
        }); // Fetch devices after state update
        this.getLevel2Options(level1);
    };

    handleLevel2Change = (event) => {
        const level2 = event.target.value;
        this.setState({
            level2: level2,
            level3: '', // Reset Level 3 when Level 2 changes
            level3Options: []
        }); // Fetch devices after state update
        this.getLevel3Options(this.state.level1, level2);
    };

    handleLevel3Change = (event) => {
        const level3 = event.target.value;
        this.setState({ level3: level3 }); // Fetch devices after Level 3 is set
        this.fetchFilteredDevices(this.state.level1, this.state.level2, level3)
    };

    handleClickOpen = (device) => {
        this.props.history.push(`/devices/${device.id}`);
    };

    handleRowHover = (index) => {
        this.setState({ hoveredRow: index });
    };

    handleRowLeave = () => {
        this.setState({ hoveredRow: null });
    };

    render() {
        return (
            <React.Fragment>
                <Title>Added Devices</Title>

                {/* Sequential Filter Component */}
                <SequentialFilter
                    level1={this.state.level1}
                    level2={this.state.level2}
                    level3={this.state.level3}
                    level1Options={this.state.level1Options}
                    level2Options={this.state.level2Options}
                    level3Options={this.state.level3Options}
                    handleLevel1Change={this.handleLevel1Change}
                    handleLevel2Change={this.handleLevel2Change}
                    handleLevel3Change={this.handleLevel3Change}
                />


                <DevicesTable
                    devices={this.state.Devices}
                    hoveredRow={this.state.hoveredRow}
                    handleRowHover={this.handleRowHover}
                    handleRowLeave={this.handleRowLeave}
                />

                {/* Devices Table */}
                {/*{!this.state.isLoading && this.state.Devices.length > 0 && (*/}
                {/*    <Table size="small">*/}
                {/*        <TableHead>*/}
                {/*            <TableRow>*/}
                {/*                <TableCell><strong>Name</strong></TableCell>*/}
                {/*                <TableCell><strong>Registration Date</strong></TableCell>*/}
                {/*                <TableCell><strong>Status</strong></TableCell>*/}
                {/*                <TableCell><strong>Place</strong></TableCell>*/}
                {/*                <TableCell><strong>Type</strong></TableCell>*/}
                {/*                <TableCell align="right"><strong>Details</strong></TableCell>*/}
                {/*            </TableRow>*/}
                {/*        </TableHead>*/}
                {/*        <TableBody>*/}
                {/*            {this.state.Devices.map((device, index) => (*/}
                {/*                <TableRow*/}
                {/*                    key={device.id}*/}
                {/*                    onMouseEnter={() => this.setState({ hoveredRow: index })}*/}
                {/*                    onMouseLeave={() => this.setState({ hoveredRow: null })}*/}
                {/*                    style={{ backgroundColor: this.state.hoveredRow === index ? '#f5f5f5' : 'inherit' }}*/}
                {/*                >*/}
                {/*                    <TableCell>{device.name}</TableCell>*/}
                {/*                    <TableCell>{device.regDate}</TableCell>*/}
                {/*                    <TableCell>{device.status}</TableCell>*/}
                {/*                    <TableCell>{device.place}</TableCell>*/}
                {/*                    <TableCell>{device.type}</TableCell>*/}
                {/*                    <TableCell align="right">*/}
                {/*                        <IconButton color="primary" component={RouterLink} to={`/devices/${device.id}`}>*/}
                {/*                            <KeyboardArrowRightIcon />*/}
                {/*                        </IconButton>*/}
                {/*                    </TableCell>*/}
                {/*                </TableRow>*/}
                {/*            ))}*/}
                {/*        </TableBody>*/}
                {/*    </Table>*/}
                {/*)}*/}
            </React.Fragment>
        );
    }
}
