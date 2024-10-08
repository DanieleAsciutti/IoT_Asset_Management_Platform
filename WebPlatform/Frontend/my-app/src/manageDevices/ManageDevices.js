import * as React from 'react';
import { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import {Select, MenuItem, InputLabel, FormControl, Snackbar, LinearProgress} from '@mui/material';
import AppBarComponent from "../components/AppBarComponent";
import DrawerComponent from '../components/DrawerComponent';
import CustomThemeProvider from "../components/ThemeProvider";
import DevicesTable from "../devices/DevicesTable";
import {toast, ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

const ManageDevices = () => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const [deviceTags, setDeviceTags] = useState([]);      // List of tags fetched from the API
    const [selectedTag, setSelectedTag] = useState('');    // Selected device tag
    const [devices, setDevices] = useState([]); // Devices data from API
    const [hoveredRow, setHoveredRow] = useState(null); // Row hover effect for table


    const userDataString = sessionStorage.getItem('userData');
    const userData = JSON.parse(userDataString);

    // Check if user data exists
    if (!userData) {
        // Redirect to sign-in page if user data is not present
        window.location.href = '/';
    }

    // Fetch device tags when the component mounts
    useEffect(() => {
        fetchDeviceTags();
    }, []);

    const toggleDrawer = () => {
        setOpen(!open); // Toggle the value of `open`
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        window.location.href = '/signin';
    };

    const handleRowHover = (index) => setHoveredRow(index);
    const handleRowLeave = () => setHoveredRow(null);


    const fetchDeviceTags = async () => {
        try {
            // const response = await fetch('/api/getAllDeviceTags', {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });

            const response = await fetch('http://localhost:9093/getAllDeviceTags', {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            const tags = await response.json();
            setDeviceTags(tags);
        } catch (error) {
            console.error('Error fetching device tags:', error);
        }
    };

    const fetchDevicesByTag = async (tag) => {
        try {
            // const response = await fetch(`/api/getDevicesByTag?tag=${tag}`, {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });

            const response = await fetch(`http://localhost:9093/getDevicesByTag?tag=${tag}`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            const data = await response.json();
            if (data == null)
                return;

            const devices = data.map(deviceString => JSON.parse(deviceString));
            setDevices(devices);
        } catch (error) {
            console.error('Error fetching devices by tag:', error);
        }
    }

    const handleSelectTag = (event) => {
        setSelectedTag(event.target.value); // Set selected tag from dropdown
        fetchDevicesByTag(event.target.value); // Fetch devices by selected tag

    };

    const handleGetMLModel = async () => {
        try {

            const deviceIds = devices.map(device => device.id);

            const response = await fetch('/api/updateModelsByTag', {
                method: 'POST',
                credentials: 'include', // Include cookies in the request
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({deviceIds}),
            });
            // const response = await fetch('http://localhost:9093/updateModelsByTag', {
            //     method: 'POST',
            //     credentials: 'include', // Include cookies in the request
            //         mode: 'cors',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({deviceIds}),
            // });

            if (response.ok) {
                toast.success('Request to update ML model sent successfully');
            } else {
                toast.error('Failed to send the request to update ML model');
            }
        } catch (error) {
            console.error('Error sending requests to update the models:', error);
        }
    };

    const handleGetDeviceData = async () => {
        try {
            const deviceIds = devices.map(device => device.id);

            const response = await fetch('/api/updateDataByTag', {
                method: 'POST',
                credentials: 'include', // Include cookies in the request
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({deviceIds}),
            });

            // const response = await fetch('http://localhost:9093/updateDataByTag', {
            //     method: 'POST',
            //     credentials: 'include', // Include cookies in the request
            //     mode: 'cors',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({deviceIds}),
            // });

            if (response.ok) {
                toast.success('Request to update data sent successfully');
            } else {
                toast.error('Failed to send the request to update data');
            }

        } catch (error) {
            console.error('Error fetching device data:', error);
        }
    };

    const handleUploadMLModel = () => {
        // Logic to upload ML model here
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pkl';
        input.onchange = async (event) => {
            const file = event.target.files[0];

            // FileReader to convert the file into a model
            const reader = new FileReader();
            reader.onload = async (event) => {
                const arrayBuffer = event.target.result;
                const model = new Uint8Array(arrayBuffer);

                const deviceIds = devices.map(device => device.id);
                const modelByTagDTO = {
                    model: Array.from(model),
                    deviceIds: deviceIds,
                    modelName: file.name,
                };

                // Post model data to server
                const response = await fetch('/api/addModelsByTag', {
                    method: 'POST',
                    credentials: 'include', // Include cookies in the request
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(modelByTagDTO),
                });
                // const response = await fetch('http://localhost:9093/addModelsByTag', {
                //     method: 'POST',
                //     credentials: 'include', // Include cookies in the request
                //     mode: 'cors',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify(modelByTagDTO),
                // });

                if (response.ok) {
                    toast.success('Model added successfully');
                } else {
                    toast.error('Failed to add model');
                }
            };
            reader.readAsArrayBuffer(file);
        };

        input.click();
    };

    return (
        <CustomThemeProvider>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBarComponent
                    pageTitle={'Manage Devices'}
                    open={open}
                    toggleDrawer={toggleDrawer}
                    anchorEl={anchorEl}
                    handleMenu={handleMenu}
                    handleClose={handleClose}
                    openMenu={Boolean(anchorEl)}
                    handleLogout={handleLogout}
                />
                <DrawerComponent open={open} toggleDrawer={toggleDrawer} />
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                        padding: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Toolbar />

                    {/* Set maxWidth to match the DevicesTable */}
                    <Grid container spacing={3} sx={{ width: '100%', maxWidth: 800 }}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h4" gutterBottom>
                                    Manage Multiple Devices
                                </Typography>

                                {/* Device Tag Selection */}
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Select Device Tag</InputLabel>
                                    <Select
                                        value={selectedTag}
                                        onChange={handleSelectTag}
                                        label="Select Device Tag"
                                    >
                                        {deviceTags.map((tag) => (
                                            <MenuItem key={tag} value={tag}>
                                                {tag}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Action Buttons */}
                                <Grid container spacing={2} justifyContent="center">
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleGetMLModel}
                                            disabled={!selectedTag}
                                        >
                                            Get ML Model
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleGetDeviceData}
                                            disabled={!selectedTag}
                                        >
                                            Get Device Data
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleUploadMLModel}
                                            disabled={!selectedTag}
                                        >
                                            Upload New ML Model
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Devices Table */}
                        <Grid item xs={12}>
                            <DevicesTable
                                devices={devices}
                                hoveredRow={hoveredRow}
                                handleRowHover={handleRowHover}
                                handleRowLeave={handleRowLeave}
                            />
                        </Grid>
                    </Grid>
                </Box>
                <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable={false}
                    pauseOnHover={false}
                />
            </Box>
        </CustomThemeProvider>
    );
};

export default ManageDevices;
