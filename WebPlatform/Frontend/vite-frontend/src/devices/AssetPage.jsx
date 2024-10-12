import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
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
import DeviceDataReports from '../reports/DeviceDataReports.jsx';
import AppBarComponent from "../components/AppBarComponent.jsx";
import DrawerComponent from '../components/DrawerComponent.jsx';
import CustomThemeProvider from "../components/ThemeProvider.jsx";

const handleLogout = () => {
    sessionStorage.removeItem('userData');
    window.location.href = '/signin';
};

export function AssetsWrapper() {
    const {id} = useParams();
    console.log(id);
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
            console.log('Failed to add attributes');
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
            console.log(data);
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
                    console.log('Failed to add model');
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
                console.log('Failed to add attributes');
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

        console.log(response);

        if (response.ok) {
            // Handle successful response
            console.log('Description added successfully');
            window.location.reload();
        } else {
            // Handle error response
            console.log('Failed to add description');
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

        console.log(this.props.deviceId);
        const response = await fetch(`/api/getAsset?id=${this.props.deviceId}`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request

        });
        const data = await response.json();
        console.log(data);
        this.setState({deviceData: data,});

        const resp = await fetch(`/api/getDeviceModelsHistory?deviceId=${this.props.deviceId}`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
        });

        const models = await resp.json();
        if (resp.ok) {
            console.log(data);
        } else {
            console.log('Failed to get device models history');
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
            console.log('Failed to update data');
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
                                            <Box mt={2}>
                                            {this.state.deviceData.asset.properties.description ? (
                                                <Typography variant="body1">
                                                    {this.state.deviceData.asset.properties.description}
                                                </Typography>
                                            ) : (
                                                <Button variant="contained" color="primary"
                                                        onClick={this.addDescription}>
                                                    Add Description
                                                </Button>
                                            )}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} style={{
                                            border: '4px solid #2196f3',
                                            maxWidth: '100%',
                                            maxHeight: '500px'
                                        }}>
                                            <div style={{maxWidth: '100%', maxHeight: '450px', overflow: 'hidden'}}>
                                                {console.log(this.state.deviceData.elementId)}
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
                                <Grid item xs={12} md={6} sx={{p: 2}}>
                                    <Grid container spacing={2} direction="column">
                                        <Grid item xs={12}>
                                            <h2>Properties</h2>
                                            <div style={{maxHeight: '500px', overflow: 'auto'}}>
                                                <Table style={{border: '4px solid #2196f3'}}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Name</TableCell>
                                                            <TableCell>Value</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {Object.keys(this.state.deviceData.asset.properties).map(key => (
                                                            <TableRow key={key}>
                                                                <TableCell>{key}</TableCell>
                                                                <TableCell>{this.state.deviceData.asset.properties[key].toString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>


                                            </div>
                                            <div style={{width: '100%'}}>
                                                <Button variant="contained" color="primary"
                                                        onClick={this.handleDialogOpen} style={{width: '100%'}}>
                                                    Add properties
                                                </Button>
                                            </div>
                                            <Dialog open={this.state.dialogOpen} onClose={this.handleDialogClose}>
                                                <DialogTitle>Add properties</DialogTitle>
                                                <DialogContent>
                                                    <TextField
                                                        autoFocus
                                                        margin="dense"
                                                        id="label"
                                                        label="Label"
                                                        type="text"
                                                        fullWidth
                                                        value={this.state.label}
                                                        onChange={this.handleLabelChange}
                                                    />
                                                    <TextField
                                                        margin="dense"
                                                        id="value"
                                                        label="Value"
                                                        type="text"
                                                        fullWidth
                                                        value={this.state.value}
                                                        onChange={this.handleValueChange}
                                                    />
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={this.handleDialogClose} color="primary">
                                                        Back
                                                    </Button>
                                                    <Button onClick={this.handleSubmit} color="primary">
                                                        Add
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                </Grid>

                        )}
                    </Box>
                </Box>
            </CustomThemeProvider>
        );
    }
}

export default AssetsWrapper;