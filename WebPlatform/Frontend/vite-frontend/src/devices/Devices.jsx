import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Orders from './DevicesList.jsx';
import PendingDevices from './PendingDevices.jsx';
import Stats from './Stats.jsx';
import { Copyright } from '../components/CopyrightComp.jsx';
import CustomThemeProvider from '../components/ThemeProvider.jsx';
import AppBarComponent from '../components/AppBarComponent.jsx';
import DrawerComponent from '../components/DrawerComponent.jsx';

const handleLogout = () => {
    sessionStorage.removeItem('userData');
    window.location.href = '/signin';
};

class Devices extends React.Component {
    async componentDidMount() {
        const userDataString = sessionStorage.getItem('userData');
        const userData = JSON.parse(userDataString);

        if (!userData) {
            // Redirect to sign-in page if user data is not present
            window.location.href = '/';
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            open: true,
            anchorEl: null,
            registeredDevices: 0,
            unregisteredDevices: 0,
        };
    }

    handleRegisteredDevices = (devices) => {
        this.setState({ registeredDevices: devices });
    };

    handleUnregisteredDevices = (devices) => {
        this.setState({ unregisteredDevices: devices });
    };

    toggleDrawer = () => {
        this.setState(prevState => ({ open: !prevState.open }));
    };

    handleMenu = (event) => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    render() {
        const openMenu = Boolean(this.state.anchorEl);
        return (
            <CustomThemeProvider>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <AppBarComponent
                        pageTitle={'Devices'}
                        open={this.state.open}
                        toggleDrawer={this.toggleDrawer}
                        anchorEl={this.state.anchorEl}
                        handleMenu={this.handleMenu}
                        handleClose={this.handleClose}
                        openMenu={openMenu}
                        handleLogout={handleLogout}
                    />
                    <DrawerComponent
                        open={this.state.open}
                        toggleDrawer={this.toggleDrawer}
                    />
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
                        }}
                    >
                        <Toolbar />
                        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8} lg={9}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: 240,
                                        }}
                                    >
                                        <PendingDevices unregisteredDevices={this.state.unregisteredDevices} onDevicesChange={this.handleUnregisteredDevices} />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4} lg={3}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: 240,
                                        }}
                                    >
                                        <Stats registeredDevices={this.state.registeredDevices} unregisteredDevices={this.state.unregisteredDevices} />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                        <Orders registeredDevices={this.state.registeredDevices} onDevicesChange={this.handleRegisteredDevices} />
                                    </Paper>
                                </Grid>
                            </Grid>
                            <Copyright sx={{ pt: 4 }} />
                        </Container>
                    </Box>
                </Box>
            </CustomThemeProvider>
        );
    }
}

export default Devices;
