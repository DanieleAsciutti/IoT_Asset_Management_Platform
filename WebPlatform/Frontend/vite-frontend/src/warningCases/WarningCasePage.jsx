import * as React from "react";
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import AppBarComponent from "../components/AppBarComponent.jsx";
import DrawerComponent from "../components/DrawerComponent.jsx";
import Toolbar from "@mui/material/Toolbar";
import {toast, ToastContainer} from "react-toastify";
import CustomThemeProvider from "../components/ThemeProvider.jsx";
import CasesTable from "./components/CasesTable.jsx";
import Typography from "@mui/material/Typography";
import CaseDialogue from "./components/CaseDialogue.jsx";


const WarningCasePage = () => {

    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);


    const [cases, setCases] = useState({});
    const [hoveredRow, setHoveredRow] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);

    const userDataString = sessionStorage.getItem('userData');
    const userData = JSON.parse(userDataString);

    // Check if user data exists
    if (!userData) {
        // Redirect to sign-in page if user data is not present
        window.location.href = '/';
    }

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

    const handleRowHover = (warnCase) => setHoveredRow(warnCase);
    const handleRowLeave = () => setHoveredRow(null);


    useEffect(() => {
        getWarnings();
    }, []);


    const handleOpenDetails = (warnCase) => {
        setSelectedCase(warnCase);
        setOpenDetailsDialog(true);
    }

    const handleCloseDetails = () => {
        setSelectedCase(null);
        setOpenDetailsDialog(false);
    }

    const getWarnings = async () => {
        try {
            const response = await fetch('/api/getWarnings', {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });
            const data = await response.json();

            setCases(data);
        } catch (error) {
            toast.error('Failed to fetch warning cases.')
            console.error(error);
        }
    }


    const closeCase = async (closeData) => {
        try {
            const body = {
                "id": selectedCase.id,
                "warning": selectedCase.type.toUpperCase(),
                "is_correct": closeData.isCorrect,
                "description": closeData.explanation,
                "note": closeData.note,
            }
            const response = await fetch(`/api/processWarningCase`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                mode: 'cors',
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error('Failed to close case. Response status: ' + response.status);
            }
            toast.success('Case processed successfully.');
            handleCloseDetails();
            getWarnings();
        } catch (error) {
            toast.error('Failed to process case.')
            console.error(error);
        }
    }

    const assignCase = async (assignedTo) => {
        try{
            const body = {
                "id": selectedCase.id,
                "warning": selectedCase.type.toUpperCase(),
                "tag": assignedTo,
            }

            const response = await fetch(`/api/assignWarningCase`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                mode: 'cors',
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error('Failed to assign case. Response status: ' + response.status);
            }
            toast.success('Case assigned successfully.');
            handleCloseDetails();
            getWarnings();
        }catch (error) {
            toast.error('Failed to assign case.')
            console.error(error);
        }
    }



    return (
        <CustomThemeProvider>
            <Box sx={{display: 'flex'}}>
                <CssBaseline/>
                <AppBarComponent
                    pageTitle={'Warning Cases'}
                    open={open}
                    toggleDrawer={toggleDrawer}
                    anchorEl={anchorEl}
                    handleMenu={handleMenu}
                    handleClose={handleClose}
                    openMenu={Boolean(anchorEl)}
                    handleLogout={handleLogout}
                />
                <DrawerComponent open={open} toggleDrawer={toggleDrawer}/>
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
                        // alignItems: 'center',
                        alignItems: 'flex-start',
                    }}
                >
                    <Toolbar/>
                    <Typography variant="h4" sx={{ mb: 2 }}>
                        Cases
                    </Typography>
                    <CasesTable cases={cases} hoveredRow={hoveredRow} handleRowHover={handleRowHover}
                            handleRowLeave={handleRowLeave} handleOpenDetails={handleOpenDetails}/>

                </Box>

                {openDetailsDialog &&
                    <CaseDialogue open={openDetailsDialog}  handleCloseDialog={handleCloseDetails} selectedCase={selectedCase} closeCase={closeCase} assignCase={assignCase}/>
                }

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

export default WarningCasePage;