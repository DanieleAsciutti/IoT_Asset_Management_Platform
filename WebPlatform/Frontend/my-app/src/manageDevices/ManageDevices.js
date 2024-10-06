import * as React from 'react';
import { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import AppBarComponent from "../components/AppBarComponent";
import DrawerComponent from '../components/DrawerComponent';
import CustomThemeProvider from "../components/ThemeProvider";
import Graph from "../components/Graph";
import DevicesTable from "../devices/DevicesTable";

const ManageDevices = () => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const [deviceTags, setDeviceTags] = useState([]);      // List of tags fetched from the API
    const [selectedTag, setSelectedTag] = useState('');    // Selected device tag
    const [dialogOpen, setDialogOpen] = useState(false);   // For handling any dialog
    const [devices, setDevices] = useState([]); // Devices data from API
    const [hoveredRow, setHoveredRow] = useState(null); // Row hover effect for table

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
            const response = await fetch(`https://your-backend-api.com/ml-model?tag=${selectedTag}`);
            const modelData = await response.json();
            console.log('ML Model data:', modelData);
        } catch (error) {
            console.error('Error fetching ML model:', error);
        }
    };

    const handleGetDeviceData = async () => {
        try {
            const response = await fetch(`https://your-backend-api.com/device-data?tag=${selectedTag}`);
            const data = await response.json();
            console.log('Device data:', data);
        } catch (error) {
            console.error('Error fetching device data:', error);
        }
    };

    const handleUploadMLModel = () => {
        // Logic to upload ML model here
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
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

                                {/* Upload Model Dialog */}
                                <Dialog open={dialogOpen} onClose={handleDialogClose}>
                                    <DialogTitle>Upload New ML Model</DialogTitle>
                                    <DialogContent>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            id="ml-model"
                                            label="Upload ML Model"
                                            type="file"
                                            fullWidth
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleDialogClose} color="primary">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleDialogClose} color="primary">
                                            Upload
                                        </Button>
                                    </DialogActions>
                                </Dialog>
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
            </Box>
        </CustomThemeProvider>
    );
};

export default ManageDevices;
