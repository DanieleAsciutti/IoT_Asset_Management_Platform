import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import {useParams} from 'react-router-dom';
import Network from './components/DevGraph.jsx';
import AppBarComponent from "../components/AppBarComponent.jsx";
import DrawerComponent from '../components/DrawerComponent.jsx';
import CustomThemeProvider from "../components/ThemeProvider.jsx";
import Properties from "./components/Properties.jsx";
import Description from "./components/Description.jsx";

const handleLogout = () => {
    sessionStorage.removeItem('userData');
    window.location.href = '/signin';
};

export function AssetsWrapper() {
    const {id} = useParams();
    return <AssetPage deviceId={id}/>;
}

class AssetPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            anchorEl: null,
            deviceData: {},
        };
    }

    handleLabelChange = (event) => {
        this.setState({label: event.target.value});
    };

    handleValueChange = (event) => {
        this.setState({value: event.target.value});
    };

    addProperties = async (label, value) => {
        const attributes = {[label]: value};

        const response = await fetch(`/api/addAttributes?assetId=${this.props.deviceId}`, {
            method: 'POST',
            credentials: 'include', // Include cookies in the request
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                    attributes
                }
            ),
        });

        // const response = await fetch(`http://localhost:9093/addAttributes?assetId=${this.props.deviceId}`, {
        //     method: 'POST',
        //     credentials: 'include', // Include cookies in the request
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //             attributes
        //         }
        //     ),
        // });

        if (response.ok) {
            // Handle successful response
            console.log('Attributes added successfully');
            this.setState(prevState => ({
                deviceData: {
                    ...prevState.deviceData,
                    asset: {
                        ...prevState.deviceData.asset,
                        properties: {
                            ...prevState.deviceData.asset.properties,
                            [label]: value // Add the new key-value pair here
                        }
                    }
                }
            }));

        } else {
            // Handle error response
            console.error('Failed to add attributes');
        }
    };

    addDescription = async (descr) => {
        let url;
        let  attributes;
        if(descr === ''){
            url = `/api/removeAttributes?assetId=${this.props.deviceId}`;
            attributes = ['description'];
        }else {
            url = `/api/addAttributes?assetId=${this.props.deviceId}`;
            attributes = {description: descr};
        }


        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                attributes
            }),
        });


        if (response.ok) {
            // Handle successful response
            console.log('Description changed successfully');
            this.setState(prevState => ({
                deviceData: {
                    ...prevState.deviceData,
                    asset: {
                        ...prevState.deviceData.asset,
                        properties: {
                            ...prevState.deviceData.asset.properties,
                            description: descr, // Update description
                        }
                    }
                }
            }));
        } else {
            // Handle error response
            console.error('Failed to change the description');
        }
    }

    async componentDidMount() {
        const userDataString = sessionStorage.getItem('userData');
        const userData = JSON.parse(userDataString);

        if (!userData) {
            // Redirect to sign-in page if user data is not present
            window.location.href = '/';
        }

        const response = await fetch(`/api/getAsset?id=${this.props.deviceId}`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request

        });
        const data = await response.json();
        this.setState({deviceData: data,});


    }

    toggleDrawer = () => {
        this.setState(prevState => ({open: !prevState.open}));
    };
    x

    handleMenu = (event) => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleClose = () => {
        this.setState({anchorEl: null});
    };


    render() {
        const openMenu = Boolean(this.state.anchorEl);
        return (
            <CustomThemeProvider>
                <Box sx={{display: 'flex'}}>
                    <CssBaseline/>
                    <AppBarComponent
                        pageTitle={'Asset Details'}
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
                            p: 2,
                        }}
                    >
                        <Toolbar/>
                        {this.state.deviceData.asset && (
                            <Grid container spacing={6} direction="row">
                                <Grid item xs={12} md={6} sx={{p: 2}}>
                                    <Grid container spacing={2} direction="column">

                                        {/*description box*/}
                                        <Grid item xs={12}>
                                            <h1>{this.state.deviceData.asset.properties.name}</h1>
                                            <Description
                                                assetDescription={this.state.deviceData.asset.properties.description}
                                                addDescription={this.addDescription}
                                            />
                                        </Grid>

                                        {/*network graph box*/}
                                        <Grid item xs={12} style={{
                                            border: '4px solid #2196f3',
                                            maxWidth: '100%',
                                            maxHeight: '500px'
                                        }}>
                                            <div style={{maxWidth: '100%', maxHeight: '450px', overflow: 'hidden'}}>
                                                <Network
                                                    id={this.state.deviceData.elementId}
                                                    l1={this.state.deviceData.asset.properties.level1}
                                                    l2={this.state.deviceData.asset.properties.level2}
                                                    l3={this.state.deviceData.asset.properties.level3}
                                                    style={{
                                                    maxWidth: '70%',
                                                    maxHeight: '70%',
                                                    overflow: 'hidden'
                                                }}/>
                                            </div>
                                        </Grid>

                                    </Grid>
                                </Grid>

                                {/*Properties box*/}
                                <Properties
                                    deviceData={this.state.deviceData}
                                    handleAddProperty={this.addProperties}
                                />
                            </Grid>

                        )}
                    </Box>
                </Box>
            </CustomThemeProvider>
        );
    }
}

export default AssetsWrapper;