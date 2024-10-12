import React, { useState, useEffect } from 'react';
import { CssBaseline, Typography, MenuItem, Select, Button, Box, Toolbar, Grid, Paper } from '@mui/material';
import CustomThemeProvider from '../components/ThemeProvider.jsx';
import AppBarComponent from '../components/AppBarComponent.jsx';
import DeviceDataReports from "./DeviceDataReports.jsx";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DrawerComponent from "../components/DrawerComponent.jsx";
import Container from "@mui/material/Container";
import SequentialFilter from "../components/SequentialFilter.jsx";

const Reports = () => {
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState("");
    const [pendingData, setPendingData] = useState(false);
    const [measurements, setMeasurements] = useState([]);
    const [level1, setLevel1] = useState('');
    const [level2, setLevel2] = useState('');
    const [level3, setLevel3] = useState('');
    const [level1Options, setLevel1Options] = useState([]);
    const [level2Options, setLevel2Options] = useState([]);
    const [level3Options, setLevel3Options] = useState([]);


    const userDataString = sessionStorage.getItem('userData');
    const userData = JSON.parse(userDataString);

    // Check if user data exists
    if (!userData) {
        // Redirect to sign-in page if user data is not present
        window.location.href = '/';
    }

    useEffect(() => {
        const fetchData = async () => {
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
                    setLevel1Options(options);
                } else {
                    console.error('Failed to fetch Level 1 options');
                }
            } catch (error) {
                console.error('Error fetching Level 1 options:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchPendingData = async () => {
            if (selectedDeviceId) {
                try {
                    const response = await fetch(`/api/getAsset?id=${selectedDeviceId}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const deviceData = await response.json();
                    const pending = deviceData.asset.properties.pendingData;
                    setPendingData(pending);

                    if (pending) {
                        const interval = setInterval(() => {
                            window.location.reload();
                        }, 15000);
                        return () => clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Error fetching pending data:', error);
                }
            }
        };

        fetchPendingData();
    }, [selectedDeviceId]);

    useEffect(() => {
        const fetchMeasurements = async () => {
            if (selectedDeviceId) {
                try {
                    const response = await fetch(`/api/retrieveDeviceDataMeasurements?deviceId=${selectedDeviceId}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const measurements = await response.json();
                    setMeasurements(measurements);
                    console.log('Measurements:', measurements);
                } catch (error) {
                    console.error('Error fetching measurements:', error);
                }
            }
        };

        fetchMeasurements();
    }, [selectedDeviceId]);



    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const handleChange = (event) => {
        setSelectedDeviceId(event.target.value);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        window.location.href = '/signin';
    };

    const handleRequestNewData = async () => {
        try {
            const response = await fetch(`/api/updateData?deviceId=${selectedDeviceId}`, {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                setPendingData(true);
            }
        } catch (error) {
            console.error('Error requesting new data:', error);
        }
    };

    const handleLevel1Change = async (event) => {
        try {
            const level1 = event.target.value;
            setLevel1(level1);
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
                setLevel2Options(options);
                setLevel3Options([]);
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    }

    const handleLevel2Change = async (event) => {
        try {
            const level2 = event.target.value;
            setLevel2(level2);
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
                setLevel3Options(options);
                console.log('Level 3 options:', options)
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    }

    const handleLevel3Change = async (event) => {
        const level3 = event.target.value;
        setLevel3(level3);
        const response = await fetch(`/api/getFilteredRegisteredDevices?l1=${level1}&l2=${level2}&l3=${level3}`, {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
        });

        const data = await response.json();
        if (data == null)
            return;

        console.log(data);
        const devices = data.map(deviceString => JSON.parse(deviceString));
        console.log(devices);
        setDevices(devices);
    }

    return (
        <CustomThemeProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <AppBarComponent
                        pageTitle={'Device Data Reports'}
                        open={open}
                        toggleDrawer={toggleDrawer}
                        anchorEl={anchorEl}
                        handleMenu={handleMenu}
                        handleClose={handleClose}
                        openMenu={Boolean(anchorEl)}
                        handleLogout={handleLogout}
                    />
                    <DrawerComponent open={open} toggleDrawer={toggleDrawer} />
                    <Box component="main" sx={{ backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900], flexGrow: 1, height: '100vh', overflow: 'auto' }}>
                        <Toolbar />
                        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>

                                        {/* Sequential Filter Component */}
                                        <SequentialFilter
                                            level1={level1}
                                            level2={level2}
                                            level3={level3}
                                            level1Options={level1Options}
                                            level2Options={level2Options}
                                            level3Options={level3Options}
                                            handleLevel1Change={handleLevel1Change}
                                            handleLevel2Change={handleLevel2Change}
                                            handleLevel3Change={handleLevel3Change}
                                        />

                                        {/* Device Selector */}
                                        {devices.length > 0 && (
                                            <>
                                                <Select
                                                    value={selectedDeviceId}
                                                    onChange={handleChange}
                                                    displayEmpty
                                                    inputProps={{ 'aria-label': 'Without label' }}
                                                    sx={{ mt: 2 }}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>
                                                    {devices.map((device) => (
                                                        <MenuItem key={device.id} value={device.id}>
                                                            {device.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>

                                                {/* Conditional rendering based on selected device */}
                                                {selectedDeviceId && (
                                                    <>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={handleRequestNewData}
                                                            disabled={pendingData}
                                                            sx={{ mt: 2 }}
                                                        >
                                                            REQUEST NEW DATA
                                                        </Button>

                                                        {pendingData && (
                                                            <Typography sx={{ mt: 2 }}>
                                                                New data requested from the device
                                                            </Typography>
                                                        )}

                                                        {measurements.length === 0 ? (
                                                            <Typography sx={{ mt: 2 }}>
                                                                No data available, please request new data
                                                            </Typography>
                                                        ) : (
                                                            <DeviceDataReports
                                                                deviceId={selectedDeviceId}
                                                                measurements={measurements}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Container>
                    </Box>
                </Box>
            </LocalizationProvider>
        </CustomThemeProvider>
    );
};

export default Reports;
