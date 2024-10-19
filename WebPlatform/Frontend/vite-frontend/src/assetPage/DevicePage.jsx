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
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import TagButton from "./components/TagButton.jsx";
import Description from "./components/Description.jsx";
import Properties from "./components/Properties.jsx";
import DataComponent from "./components/DataComponent.jsx";
import {toast, ToastContainer} from "react-toastify";
import ManageModels from "./components/ManageModels.jsx";

const handleLogout = () => {
    sessionStorage.removeItem('userData');
    window.location.href = '/signin';
};

export function DevicesWrapper() {
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
            hasData: false,
            measurements: [],
            modelHistory: [],
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
                    modelName: file.name,
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

                    // Set new the pendingModel just sent
                    this.setState(prevState => ({
                        deviceData: {
                            ...prevState.deviceData,
                            asset: {
                                ...prevState.deviceData.asset,
                                properties: {
                                    ...prevState.deviceData.asset.properties,
                                    pendingModel: file.name
                                }
                            }
                        }
                    }));

                    // Call the function to get the updated model history
                    await this.getDeviceModelsHistory();
                } else {
                    // Handle error response
                    console.error('Failed to add model');
                }
            };
            reader.readAsArrayBuffer(file);

        /*
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
*/
        };


        input.click();
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

    async getAssetData(){
        const response = await fetch(`/api/getAsset?id=${this.props.deviceId}`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request

        });
        // const response = await fetch(`http://localhost:9093/getAsset?id=${this.props.deviceId}`, {
        //     method: 'GET',
        //     credentials: 'include', // Include cookies in the request
        //
        // });
        const data = await response.json();
        this.setState({deviceData: data,});

    }

    async getDeviceModelsHistory(){
        const resp = await fetch(`/api/getDeviceModelsHistory?deviceId=${this.props.deviceId}`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
        });
        // const resp = await fetch(`http://localhost:9093/getDeviceModelsHistory?deviceId=${this.props.deviceId}`, {
        //     method: 'GET',
        //     credentials: 'include', // Include cookies in the request
        // });

        const dataModel = await resp.json();
        const modelsfromUser = dataModel.userHistory;
        modelsfromUser.forEach(item => {
            item.from = "User";
        });
        const modelsfromDevice = dataModel.assetHistory;
        modelsfromDevice.forEach(item => {
            item.from = "Device";
        });
        const models = modelsfromUser.concat(modelsfromDevice);
        if (resp.ok) {
            console.log("Models history retrieved successfully");
        } else {
            console.error('Failed to get device models history');
        }
        this.setState({modelHistory: models});
    }


    async componentDidMount() {
        const userDataString = sessionStorage.getItem('userData');
        const userData = JSON.parse(userDataString);

        if (!userData) {
            // Redirect to sign-in page if user data is not present
            window.location.href = '/';
        }

        await this.getAssetData();

        await this.getDeviceModelsHistory();

        const response2 = await fetch(`/api/retrieveDeviceDataMeasurements?deviceId=${this.props.deviceId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        // const response2 = await fetch(`http://localhost:9093/retrieveDeviceDataMeasurements?deviceId=${this.props.deviceId}`, {
        //     method: 'GET',
        //     credentials: 'include',
        //     headers: { 'Content-Type': 'application/json' }
        // });

        if (response2.ok) {
            const measurements = await response2.json();
            if ( measurements.length === 0)
            {
                this.setState({hasData: false,});
            }
            else
            {
                this.setState({hasData: true,});
                this.setState({measurements: measurements,});
            }
        } else {
            console.error('Error fetching measurements:');
        }

    }

    handleReceiveData = async () => {
        const response = await fetch(`/api/updateData?deviceId=${this.props.deviceId}`, {
            method: 'POST',
            credentials: 'include', // Include cookies in the request
        });
        // const response = await fetch(`http://localhost:9093/updateData?deviceId=${this.props.deviceId}`, {
        //     method: 'POST',
        //     credentials: 'include', // Include cookies in the request
        // });
        if (response.ok) {
            // Update the pendingData value in the state
            this.setState(prevState => ({
                deviceData: {
                    ...prevState.deviceData,
                    asset: {
                        ...prevState.deviceData.asset,
                        properties: {
                            ...prevState.deviceData.asset.properties,
                            pendingData: true,
                        }
                    }
                }
            }));
            console.log('Data updated successfully');
        } else {
            toast.error('Failed to update data');
            console.error('Failed to update data');
        }
    }

    downloadModel = async (modelName) => {
        const response = await fetch(`/api/retrieveModel?deviceId=${this.props.deviceId}&modelName=${modelName}&fromUser=true`, {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
        });
        // const response = await fetch(`http://localhost:9093/retrieveModel?assetId=${this.props.deviceId}&modelName=${modelName}&fromUser=true`, {
        //     method: 'GET',
        //     credentials: 'include', // Include cookies in the request
        // });
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
    
    getModel = async () => {
        const response = await fetch(`/api/updateModel?deviceId=${this.props.deviceId}`, {
            method: 'POST',
            credentials: 'include', // Include cookies in the request
        });
        if (response.ok) {
            console.log('Model updated successfully');
            this.setState(prevState => ({
                deviceData: {
                    ...prevState.deviceData,
                    asset: {
                        ...prevState.deviceData.asset,
                        properties: {
                            ...prevState.deviceData.asset.properties,
                            pendingRetrieve: true,
                        }
                    }
                }
            }));
        } else {
            toast.error('Failed to update Model');
            console.error('Failed to update Model');
        }
    }

    // handleFetchHasData = async () => {
    //     const response = await fetch(`/api/retrieveDeviceDataMeasurements?deviceId=${this.props.deviceId}`, {
    //         method: 'GET',
    //         credentials: 'include',
    //         headers: { 'Content-Type': 'application/json' }
    //     });
    //     if (response.ok) {
    //         const measurements = await response.json();
    //         if ( measurements.length === 0)
    //         {
    //             this.setState({hasData: false,});
    //         }
    //         else
    //         {
    //             this.setState({hasData: true,});
    //             this.setState({measurements: measurements,});
    //         }
    //         console.log('Measurements:', measurements);
    //     } else {
    //         console.error('Error fetching measurements:');
    //     }
    // }

    addTag = async (newTag) => {
        //TODO: SE newTag è null vuol dire che è da eliminare il tag e non modificare
        try {
            // API endpoint for adding or modifying the tag
            const response = await fetch(`/api/modifyDeviceTag`, {
                method: 'POST', // or PUT if you are modifying an existing tag
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deviceId: this.props.deviceId,
                    tag: newTag,
                }),
            });

            // const response = await fetch(`http://localhost:9093/modifyDeviceTag`, {
            //     method: 'POST', // or PUT if you are modifying an existing tag
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         deviceId: this.props.deviceId,
            //         tag: newTag
            //     }),
            //     credentials: 'include',
            // });

            if (!response.ok) {
                // Handle error if response is not OK
                this.setState((prevState) => ({
                    deviceData: {
                        ...prevState.deviceData,
                        asset: {
                            ...prevState.deviceData.asset,
                            properties: {
                                ...prevState.deviceData.asset?.properties,  // Safely access properties
                                tag: null  // Set tag to null (add if it doesn't exist)
                            }
                        }
                    }
                }));

                throw new Error('Failed to add the tag');
            }

        }catch (error) {
            // Handle any errors from the API
            console.error('Error adding the tag:', error);
        }
    }

    render() {
        const openMenu = Boolean(this.state.anchorEl);
        return (
            <CustomThemeProvider>
               <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{display: 'flex'}}>
                    <CssBaseline/>
                    <AppBarComponent
                        pageTitle={'Device Details'}
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

                                {/*Tag box*/}
                                <Grid item xs={12}>
                                    <TagButton currTag={this.state.deviceData.asset.properties?.tag ? this.state.deviceData.asset.properties.tag : null}
                                               addTag={this.addTag}
                                    />
                                </Grid>

                                {/*Reports box*/}
                                <Grid item xs={12} sx={{p: 2}}>
                                    <Grid container spacing={2} direction="column">

                                        {/*Models box*/}
                                        <ManageModels
                                            deviceData={[
                                                this.state.deviceData.asset.properties.currentModel,
                                                this.state.deviceData.asset.properties.pendingModel,
                                                this.state.deviceData.asset.properties.pendingModel
                                            ]}
                                            modelHistory={this.state.modelHistory}
                                            getModel={this.getModel}
                                            loadNewModel={this.loadNewModel}
                                            downloadModel={this.downloadModel}
                                        />

                                        {/*Data box*/}
                                        <DataComponent
                                            pendingData={this.state.deviceData.asset.properties.pendingData}
                                            hasData={this.state.hasData}
                                            handleReceiveData={this.handleReceiveData}
                                            deviceId={this.props.deviceId}
                                            measurements={this.state.measurements}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
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
               </LocalizationProvider>
            </CustomThemeProvider>
        );
    }
}

export default DevicesWrapper;