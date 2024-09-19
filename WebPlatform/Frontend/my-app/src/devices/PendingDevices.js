import React, {useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Network from './DevicesGraph';
import CircularProgress from '@mui/material/CircularProgress';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default class Devices extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            open: false,
            deviceData: { id: '', name: '', place: '', type: '', status: '', level1: '', level2: '', level3: '' },
            pendingDevices: [],
            unregisteredDevices: 0,
            dialogStep: 0,
            hoveredRow: null,
            connectionName: '',
            isLoading: false,
            level1Options: [],
            level2Options: [],
            level3Options: [],
            newL1DialogOpen: false,
            newL2DialogOpen: false,
            newL3DialogOpen: false,
        };
    }


    async componentDidMount() {
        this.setState({ isLoading: true });
        const response = await fetch('/api/getAllUnregisteredDevices', {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
            mode : 'cors',
        });
        // const response = await fetch('http://localhost:9093/getAllUnregisteredDevices', {
        //     method: 'GET',
        //     credentials: 'include', // Include cookies in the request
        //     mode : 'cors',
        // });
        const data = await response.json();
        console.log(data);
        this.setState({ pendingDevices: data ,unregisteredDevices: data.length, isLoading: false});
        console.log(this.state.pendingDevices);
    }

    componentDidUpdate(prevState) {
        if (this.state.unregisteredDevices !== prevState.unregisteredDevices) {
            this.props.onDevicesChange(this.state.unregisteredDevices);
        }

    }

    async getLevel1Options() {
        try {
            // const response = await fetch(`http://localhost:9093/getLevel1`, {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });
            const response = await fetch(`/api/getLevel1`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const level1Options = await response.json();
            this.setState({ level1Options });
        } catch (error) {
            console.error('Failed to fetch level 1 options:', error);
            // Handle the error appropriately
        }
    }

    async registerDevice(id, place, type, status, level1, level2, level3) {
        const deviceDTO = {
            place: place,
            type: type,
            status: status,
            level1: level1,
            level2: level2,
            level3: level3
        };

        const response = await fetch(`/api/registerDevice?id=${id}`, {
            method: 'POST',
            credentials: 'include', // Include cookies in the request
            mode : 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deviceDTO),
        });
        // const response = await fetch(`http://localhost:9093/registerDevice?id=${id}`, {
        //     method: 'POST',
        //     credentials: 'include', // Include cookies in the request
        //     mode : 'cors',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(deviceDTO),
        // });

        this.getLevel1Options();
        if (!response.ok) {
            console.log('Failed to register device');
        }
        
    }
    handleNodeClick = async(nodeId) => {
        console.log(nodeId);
        console.log(this.state.deviceData.id);
        const connectionName = window.prompt("Please enter the connection name");
        if (connectionName) {
            this.setState({ connectionName });
        
            const relationships = {
                "relationships": {
                [nodeId]: connectionName}
            };
            console.log(relationships);
            const response = await fetch(`/api/addRelationships?assetId=${this.state.deviceData.id}`, {
                method: 'POST',
                credentials: 'include', // Include cookies in the request
                mode : 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(relationships),
            });
            // const response = await fetch(`http://localhost:9093/addRelationships?assetId=${this.state.deviceData.id}`, {
            //     method: 'POST',
            //     credentials: 'include', // Include cookies in the request
            //     mode : 'cors',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(relationships),
            // });

            if (!response.ok) {
                console.log('Failed to add relationship to device');
            }
        }
    };

    handleOpenNewL1Dialog = () => this.setState({ newL1DialogOpen: true });
    handleOpenNewL2Dialog = () => this.setState({ newL2DialogOpen: true });
    handleOpenNewL3Dialog = () => this.setState({ newL3DialogOpen: true });
    handleCloseNewL1Dialog = () => this.setState({ newL1DialogOpen: false });
    handleCloseNewL2Dialog = () => this.setState({ newL2DialogOpen: false });
    handleCloseNewL3Dialog = () => this.setState({ newL3DialogOpen: false });

    addNewLevel1 = () => {
        this.setState(prevState => ({
            level1Options: [...prevState.level1Options, prevState.deviceData.level1],
            newL1DialogOpen: false,
        }));
    };

    addNewLevel2 = () => {
        this.setState(prevState => ({
            level2Options: [...prevState.level2Options, prevState.deviceData.level2],
            newL2DialogOpen: false,
        }));
    }

    addNewLevel3 = () => {
        this.setState(prevState => ({
            level3Options: [...prevState.level3Options, prevState.deviceData.level3],
            newL3DialogOpen: false,
        }));
    }

    handleOpen = (id, name) => {
        this.setState({ deviceData: { ...this.state.deviceData, id: id, name: name }, open: true });
        this.getLevel1Options()
    };

    handleClose = () => {
        this.setState({ open: false });
        this.setState({ dialogStep: 0 });
        this.setState({deviceData: {...this.state.deviceData, level1: '', level2: '', level3: ''}});

    };

    handleChange = (event) => {
        this.setState({ deviceData: { ...this.state.deviceData, [event.target.name]: event.target.value } });
    };

    handleRegister = () => {
        const { id, place, type, status, level1, level2, level3 } = this.state.deviceData;
        this.registerDevice(id, place, type, status, level1, level2, level3);
        this.handleClose();
    };

    handleNext = () => {
        this.setState(prevState => ({ dialogStep: prevState.dialogStep + 1 }));

    };

    handleLevel1Change = async (event) => {
        const level1 = event.target.value;
        this.setState({
            deviceData: { ...this.state.deviceData, level1, level2: '', level3: '' },
            level2Options: [],
            level3Options: [],
        });

        if (level1) {
            // const response = await fetch(`http://localhost:9093/getLevel2?level1=${level1}`, {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });
            const response = await fetch(`/api/getLevel2?level1=${level1}`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });
            const level2Options = await response.json();
            this.setState({ level2Options });
        }
    };

    handleLevel2Change = async (event) => {
        const level2 = event.target.value;
        this.setState({
            deviceData: { ...this.state.deviceData, level2, level3: '' },
            level3Options: [],
        });

        if (level2) {
            // const response = await fetch(`http://localhost:9093/getLevel3?level1=${this.state.deviceData.level1}&level2=${level2}`, {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });
            const response = await fetch(`/api/getLevel3?level1=${this.state.deviceData.level1}&level2=${level2}`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });
            const level3Options = await response.json();
            this.setState({ level3Options });
        }
    };

    render() {
        return (
            <React.Fragment>
                <div style={{ height: '500px', overflow: 'auto' }}>
                    <Title>Unregistered Devices</Title>
                    {this.state.unregisteredDevices === 0 ? (
                        <p>No devices to register</p>
                    ) : (
                        <>
                            {this.state.isLoading && <CircularProgress />}
                            {!this.state.isLoading && (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>ID</strong></TableCell>
                                            <TableCell><strong>Name</strong></TableCell>
                                            <TableCell><strong>Status</strong></TableCell>
                                            <TableCell><strong>Last Modified</strong></TableCell>
                                            <TableCell align="right"><strong>Register</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {this.state.pendingDevices && this.state.pendingDevices.length > 0 ? (
                                        this.state.pendingDevices.map((device, index) => {
                                            return (
                                                <TableRow
                                                    key={device.id}
                                                    onMouseEnter={() => this.setState({ hoveredRow: index })}
                                                    onMouseLeave={() => this.setState({ hoveredRow: null })}
                                                    style={{ backgroundColor: this.state.hoveredRow === index ? '#f5f5f5' : 'inherit' }}
                                                >
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{device.name}</TableCell>
                                                    <TableCell>
                                                        <span style={{ color: device.status === 'Connected' ? 'green' : 'red' }}>●</span>
                                                    </TableCell>
                                                    <TableCell>{device.lastModified}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton color="primary" onClick={() => this.handleOpen(device.id, device.name)}>
                                                            <AddIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <p>Nessun dispositivo in sospeso.</p>
                                    )}
                                    </TableBody>
                                </Table>
                            )}
                        </>
                    )}
                </div>
                { this.state.open &&
                    <Dialog open={this.state.open} onClose={this.handleClose}>
                    {this.state.dialogStep === 0 && (
                        <>
                            <DialogTitle>Register Device</DialogTitle>
                            <DialogContent>
                                <TextField name="id" label="ID" value={this.state.deviceData.id} onChange={this.handleChange} fullWidth />
                                <TextField name="name" label="Name" value={this.state.deviceData.name} onChange={this.handleChange} fullWidth />
                                <TextField name="place" label="Place" value={this.state.deviceData.place} onChange={this.handleChange} fullWidth />
                                <TextField name="type" label="Type" value={this.state.deviceData.type} onChange={this.handleChange} fullWidth />
                                <TextField name="status" label="Status" value={this.state.deviceData.status} onChange={this.handleChange} fullWidth />
                                <FormControl fullWidth>
                                    <InputLabel id="level1-label">Level 1</InputLabel>
                                    <Select
                                        labelId="level1-label"
                                        value={this.state.deviceData.level1}
                                        onChange={(e) => {
                                            if (e.target.value === 'new') {
                                                this.handleOpenNewL1Dialog();
                                            } else {
                                                this.setState({
                                                    deviceData: { ...this.state.deviceData, level1: e.target.value }
                                                });
                                                this.handleLevel1Change(e); // Fetch Level 2 options
                                            }
                                        }}
                                        label="Level 1"
                                        fullWidth
                                    >
                                        {this.state.level1Options.map((option, index) => (
                                            <MenuItem key={index} value={option}>{option}</MenuItem>
                                        ))}
                                        <MenuItem value="new">+ Add New Level 1</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel id="level2-label">Level 2</InputLabel>
                                    <Select
                                        labelId="level2-label"
                                        value={this.state.deviceData.level2}
                                        onChange={(e) => {
                                            if (e.target.value === 'new') {
                                                this.handleOpenNewL2Dialog();
                                            } else {
                                                this.setState({
                                                    deviceData: { ...this.state.deviceData, level2: e.target.value }
                                                });
                                                this.handleLevel2Change(e); // Fetch Level 3 options
                                            }
                                        }}
                                        label="Level 2"
                                        fullWidth
                                        disabled={!this.state.deviceData.level1}
                                    >
                                        {this.state.level2Options.map((option, index) => (
                                            <MenuItem key={index} value={option}>{option}</MenuItem>
                                        ))}
                                        <MenuItem value="new">+ Add New Level 2</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel id="level3-label">Level 3</InputLabel>
                                    <Select
                                        labelId="level3-label"
                                        value={this.state.deviceData.level3}
                                        onChange={(e) => {
                                            if (e.target.value === 'new') {
                                                this.handleOpenNewL3Dialog();
                                            } else {
                                                this.setState({
                                                    deviceData: { ...this.state.deviceData, level3: e.target.value }
                                                });
                                                // this.handleLevel3Change(e); // Fetch Level 3 options
                                            }
                                        }}
                                        label="Level 3"
                                        fullWidth
                                        disabled={!this.state.deviceData.level2}
                                    >
                                        {this.state.level3Options.map((option, index) => (
                                            <MenuItem key={index} value={option}>{option}</MenuItem>
                                        ))}
                                        <MenuItem value="new">+ Add New Level 3</MenuItem>
                                    </Select>
                                </FormControl>


                                <Dialog open={this.state.newL1DialogOpen} onClose={this.handleCloseNewL1Dialog}>
                                    <DialogTitle>Add New Level 1</DialogTitle>
                                    <DialogContent>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="New Level 1"
                                            fullWidth
                                            value={this.state.deviceData.level1} // Bind to deviceData.level1
                                            onChange={(e) => this.setState({ deviceData: { ...this.state.deviceData, level1: e.target.value } })}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={this.handleCloseNewL1Dialog}>Cancel</Button>
                                        <Button onClick={this.addNewLevel1} color="primary">Add</Button>
                                    </DialogActions>
                                </Dialog>
                                <Dialog open={this.state.newL2DialogOpen} onClose={this.handleCloseNewL2Dialog}>
                                    <DialogTitle>Add New Level 2</DialogTitle>
                                    <DialogContent>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="New Level 2"
                                            fullWidth
                                            value={this.state.deviceData.level2} // Bind to deviceData.level2
                                            onChange={(e) => this.setState({ deviceData: { ...this.state.deviceData, level2: e.target.value } })}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={this.handleCloseNewL2Dialog}>Cancel</Button>
                                        <Button onClick={this.addNewLevel2} color="primary">Add</Button>
                                    </DialogActions>
                                </Dialog>
                                <Dialog open={this.state.newL3DialogOpen} onClose={this.handleCloseNewL3Dialog}>
                                    <DialogTitle>Add New Level 3</DialogTitle>
                                    <DialogContent>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            label="New Level 3"
                                            fullWidth
                                            value={this.state.deviceData.level3} // Bind to deviceData.level3
                                            onChange={(e) => this.setState({ deviceData: { ...this.state.deviceData, level3: e.target.value } })}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={this.handleCloseNewL3Dialog}>Cancel</Button>
                                        <Button onClick={this.addNewLevel3} color="primary">Add</Button>
                                    </DialogActions>
                                </Dialog>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.handleClose}>Cancel</Button>
                                <Button onClick={this.handleNext}>Next</Button>
                            </DialogActions>
                        </>
                    )}
                    {this.state.dialogStep === 1 && (
                        <>
                            <DialogTitle>Select the links</DialogTitle>
                            <DialogContent>
                                <Network onNodeClick={this.handleNodeClick}/>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.handleClose}>Cancel</Button>
                                <Button onClick={this.handleRegister}>Register</Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
                }
            </React.Fragment>
            
        );
    }
}