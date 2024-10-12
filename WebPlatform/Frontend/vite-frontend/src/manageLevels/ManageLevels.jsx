import * as React from 'react';
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import AppBarComponent from "../components/AppBarComponent.jsx";
import DrawerComponent from "../components/DrawerComponent.jsx";
import CustomThemeProvider from "../components/ThemeProvider.jsx";
import {useEffect, useState} from "react";
import SequentialFilter from "../components/SequentialFilter.jsx";
import {
    Button, Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Paper,
    Select,
    Toolbar,
    Typography
} from "@mui/material";
import Container from "@mui/material/Container";
import NodeTable from "./NodeTable.jsx";
import {toast, ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


const ManageLevels = () => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const [level1, setLevel1] = useState('');
    const [level2, setLevel2] = useState('');
    const [level3, setLevel3] = useState('');
    const [level1Options, setLevel1Options] = useState([]);
    const [level2Options, setLevel2Options] = useState([]);
    const [level3Options, setLevel3Options] = useState([]);

    const [assets, setassets] = useState([]);

    const [openDialog, setOpenDialog] = useState(false);


    //TODO RIMETTERE IL CONTROLLO SUL LOGIN
    // const userDataString = sessionStorage.getItem('userData');
    // const userData = JSON.parse(userDataString);
    //
    // // Check if user data exists
    // if (!userData) {
    //     // Redirect to sign-in page if user data is not present
    //     window.location.href = '/';
    // }

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

    useEffect(() => {
        fetchLevel1Data();
    }, []);

    const fetchLevel1Data = async () => {
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
                setLevel2Options([]);
                setLevel3Options([]);
                setLevel1('');
                setLevel2('');
                setLevel3('');
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    };

    const handleLevel1Change = async (event) => {
        setLevel1(event.target.value);
        const level1 = event.target.value;
        setLevel2('');
        setLevel3('');
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
        await fetchAssets(level1);
    }

    const handleLevel2Change = async (event) => {
        setLevel2(event.target.value);
        const level2 = event.target.value;
        setLevel3('');
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
        } else {
            console.error('Failed to fetch Level 1 options');
        }
        await fetchAssets(level1, level2);
    }

    const handleLevel3Change = async (event) => {
        setLevel3(event.target.value);
        await fetchAssets(level1, level2, event.target.value);
    }

    const fetchAssets = async (level1, level2, level3) => {

        let url = `/api/getNodesDataByLevels?l1=${level1}`
        // let url = `http://localhost:9093/getNodesDataByLevels?l1=${level1}`

        if (level2) {
            url += `&l2=${level2}`;
            if (level3) {
                url += `&l3=${level3}`;
            }
        }

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
        });

        if(response.ok){
            const data = await response.json();
            setassets(data);
        }else{
            console.error('Failed to fetch assets');
        }
    }


    const handleDeleteClick = () => {
        setOpenDialog(true);
    }

    const handleConfirmDelete = async () => {

        let url = `/api/deleteNodesByLevels?l1=${level1}`
        // let url = `http://localhost:9093/deleteNodesByLevels?l1=${level1}`

        if (level2) {
            url += `&l2=${level2}`;
            if (level3) {
                url += `&l3=${level3}`;
            }
        }

        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
        });

        if(response.ok){
            setassets([]);
            setOpenDialog(false);
            toast.success('Nodes deleted successfully');
            fetchLevel1Data();
        }else{
            toast.error('Failed to delete nodes');
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    return (
        <CustomThemeProvider>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBarComponent
                    pageTitle={'Manage Levels'}
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
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>

                                    <Typography variant="h4" gutterBottom>
                                        Select the levels
                                    </Typography>

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

                                    {/* Conditionally render DevicesTable */}
                                    {assets && assets.length > 0 && (
                                        <NodeTable assets={assets} />
                                    )}

                                    {/* Delete Nodes Button */}
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={handleDeleteClick}
                                        sx={{ mt: 2, ml: 'auto', display: 'block' }}
                                    >
                                        Delete Nodes
                                    </Button>

                                    {/* Delete Confirmation Dialog */}
                                    <Dialog open={openDialog} onClose={handleCloseDialog}>
                                        <DialogTitle>Confirm Delete</DialogTitle>
                                        <DialogContent>
                                            <Typography>Are you sure you want to delete the selected nodes?</Typography>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button
                                                onClick={handleCloseDialog}
                                                variant="contained"
                                                color="primary"
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                onClick={handleConfirmDelete}
                                                color="secondary"
                                                variant="contained"
                                            >
                                                Confirm Delete
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Container>
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
}

export default ManageLevels;