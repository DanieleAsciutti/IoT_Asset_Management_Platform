import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import {useParams} from 'react-router-dom';
import Network from './DevGraph.jsx';
import AppBarComponent from "../components/AppBarComponent.jsx";
import DrawerComponent from '../components/DrawerComponent.jsx';
import CustomThemeProvider from "../components/ThemeProvider.jsx";
import Description from "./Description.jsx";
import Properties from "./components/Properties.jsx";

const handleLogout = () => {
    sessionStorage.removeItem('userData');
    window.location.href = '/signin';
};

export function AssetsWrapper() {
    const {id} = useParams();
    return <Devices deviceId={id}/>;
}

class Devices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            anchorEl: null,
            deviceData: {},
            dialogOpen: false,
            label: '',
            value: '',
            modelHistory: [],
        };
    }

    handleDialogOpen = () => {
        this.setState({dialogOpen: true});
    };

    handleDialogClose = () => {
        this.setState({dialogOpen: false});
    };

    handleLabelChange = (event) => {
        this.setState({label: event.target.value});
    };

    handleValueChange = (event) => {
        this.setState({value: event.target.value});
    };

    handleSubmit = async () => {
        const attributes = {[this.state.label]: this.state.value};

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

        if (response.ok) {
            // Handle successful response
            console.log('Attributes added successfully');
            this.setState({dialogOpen: false, label: '', value: ''});
        } else {
            // Handle error response
            console.error('Failed to add attributes');
        }
    };

    getModel = async () => {
        const response = await fetch(`/api/getModel?assetId=${this.props.deviceId}`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
            mode: 'cors',
        });
        const data = await response.json();
        if (response.ok) {
            // Handle successful response
            console.log('Model retrieved successfully');
            alert('Model retrieved successfully');
        }

    };

    // Funzione per caricare un nuovo modello
    // aggiornare pendingModel,
    // apre una finestrina per caricare il modello e dare un nome al modello

    loadNewModel = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pkl';
        input.onchange = async (event) => {
            const file = event.target.files[0];

            // Fai qualcosa con il file e il nome del modello qui, ad esempio caricarli su un server
            // Aggiorna lo stato con il nuovo modello
            const reader = new FileReader();
            reader.onload = async (event) => {
                const arrayBuffer = event.target.result;
                const model = new Uint8Array(arrayBuffer);

                const modelDTO = {
                    model: Array.from(model),
                    assetId: this.props.deviceId,
                    fromUser: true,
                };

                const response = await fetch('/api/addNewModel', {
                    method: 'POST',
                    credentials: 'include', // Include cookies in the request
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(modelDTO),
                });

                if (response.ok) {
                    // Handle successful response
                    console.log('Model added successfully');
                } else {
                    // Handle error response
                    console.error('Failed to add model');
                }
            };
            reader.readAsArrayBuffer(file);


            const attributes = {'pendingModel': file.name};

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

            if (response.ok) {
                // Handle successful response
                console.log('Attributes added successfully');
            } else {
                // Handle error response
                console.error('Failed to add attributes');
            }

        };
        input.click();
    };

    addDescription = () => {
        const descr = prompt('Inserisci la descrizione');
        const attributes = {description: descr};
        const response = fetch(`/api/addAttributes?assetId=${this.props.deviceId}`, {
            method: 'POST',
            credentials: 'include', // Include cookies in the request
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                attributes
            }),
        });


        if (response.ok) {
            // Handle successful response
            console.log('Description added successfully');
            window.location.reload();
        } else {
            // Handle error response
            console.error('Failed to add description');
            window.location.reload();
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

        const resp = await fetch(`/api/getDeviceModelsHistory?deviceId=${this.props.deviceId}`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
        });

        const models = await resp.json();
        if (resp.ok) {
            console.log('Device models history retrieved successfully');
        } else {
            console.error('Failed to get device models history');
        }
        this.setState({modelHistory: models});

    }

    handleReceiveData = async () => {
        const response = await fetch(`/api/updateData?deviceId=${this.props.deviceId}`, {
            method: 'POST',
            credentials: 'include', // Include cookies in the request
        });
        if (response.ok) {
            console.log('Data updated successfully');
        } else {
            console.error('Failed to update data');
        }
    }
    downloadModel = async (modelName) => {
        const response = await fetch(`/api/retrieveModel?assetId=${this.props.deviceId}&modelName=${modelName}&fromUser=true`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
        });
        const data = await response.blob();
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', modelName);
        document.body.appendChild(link);
        link.click();
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
                                        <Grid item xs={12}>
                                            <h1>{this.state.deviceData.asset.properties.name}</h1>
                                            <Description
                                                assetDescription={this.state.deviceData.asset.properties.description}
                                                addDescription={this.addDescription}
                                            />
                                        </Grid>
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
                                    handleAddProperty={this.handleSubmit}
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