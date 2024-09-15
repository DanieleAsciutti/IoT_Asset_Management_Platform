import React, { useEffect, useState } from 'react';
import Graph from "../components/Graph";
import { CssBaseline, Box, Toolbar, MenuItem, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, InputLabel, FormControl } from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import CustomThemeProvider from '../components/ThemeProvider';
import AppBarComponent from '../components/AppBarComponent';
import DrawerComponent from '../components/DrawerComponent';

function Assets() {

    const userDataString = sessionStorage.getItem('userData');
    const userData = JSON.parse(userDataString);

    //Check if user data exists in session storage
    if (!userData) {
        // Redirect to sign-in page if user data is not present
        window.location.href = '/';
    }


    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [addOpen, setAddOpen] = useState(false);

    // Graph data
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);

    // New Asset data
    const [name, setName] = useState('');
    const [label, setLabel] = useState('MonitoringTarget'); // Default label
    const [addL1, setAddL1] = useState('');
    const [addL2, setAddL2] = useState('');
    const [addL3, setAddL3] = useState('');
    const [addL1Options, setAddL1Options] = useState([]);
    const [addL2Options, setAddL2Options] = useState([]);
    const [addL3Options, setAddL3Options] = useState([]);

    // Filter data
    const [level1, setLevel1] = useState('');
    const [level2, setLevel2] = useState('');
    const [level3, setLevel3] = useState('');
    const [level1Options, setLevel1Options] = useState([]);
    const [level2Options, setLevel2Options] = useState([]);
    const [level3Options, setLevel3Options] = useState([]);
    const [currentFilter, setCurrentFilter] = useState('l1');

    const toggleDrawer = () => {
        setOpen(!open); // Toggle the value of `open`
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        //fetchData();
        getLevel1Options();
    }, []);

    // Part used to update the levels
    const updateLevel = (value) => {
        if (currentFilter === 'l1') {
            handleLevel1Change(value);
        } else if (currentFilter === 'l2') {
            handleLevel2Change(value);
        } else if (currentFilter === 'l3') {
            handleLevel3Change(value);
        }
    };


    const handleLevel1Change = (e, fromAsset) => {
        let selectedLevel1;
        if(fromAsset) {
            selectedLevel1 = e.target.value;
        }else{
            selectedLevel1 = e.value;
        }

        setLevel1(selectedLevel1);

        setLevel2Options([]); // Reset level2 options
        setLevel3Options([]); // Reset level3 options
        setLevel2('');
        setLevel3('');
        setCurrentFilter('l2');
        getLevel2Options(selectedLevel1);
    };

    const handleLevel2Change = (e, fromAsset) => {
        let selectedLevel2;
        if(fromAsset) {
            selectedLevel2 = e.target.value;
        }else{
            selectedLevel2 = e.value
        }

        setLevel2(selectedLevel2);

        setLevel3Options([]); // Reset level3 options
        setLevel3('');
        setCurrentFilter('l3');
        getLevel3Options(level1, selectedLevel2);
    };

    const handleLevel3Change = (e, fromAsset) => {
        let selectedLevel3;
        if(fromAsset) {
            selectedLevel3 = e.target.value;
        }else{
            selectedLevel3 = e.value
        }
        setLevel3(selectedLevel3);
        setCurrentFilter('filtered');
        getFilteredNetwork(level1, level2, selectedLevel3);
    };

    const getLevel1Options = async () => {
        try {
            // const response = await fetch('/api/getLevel1', {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });
            const response = await fetch('http://localhost:9093/getLevel1', {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            if (response.ok) {
                const options = await response.json(); // Parse JSON response
                setLevel1Options(options); // Assuming options is an array of strings
                setNodes(options.map((str, index) => ({
                    id: index + 1,
                    name: str,
                    label: str
                })));
                setLinks([]);
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    };

    const getLevel2Options = async (level1) => {
        try {
            // const response = await fetch('/api/getLevel2?level1=${level1}', {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });
            const response = await fetch(`http://localhost:9093/getLevel2?level1=${level1}`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            if (response.ok) {
                const options = await response.json(); // Parse JSON response
                setLevel2Options(options);
                setNodes(options.map((str, index) => ({
                    id: index + 1,
                    name: str,
                    label: str
                })));
                setLinks([]);
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    };

    const getLevel3Options = async (level1, level2) => {
        try {
            // const response = await fetch('/api/getLevel3?level1=${level1}&level2=${level2}', {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });
            const response = await fetch(`http://localhost:9093/getLevel3?level1=${level1}&level2=${level2}`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            if (response.ok) {
                const options = await response.json(); // Parse JSON response
                setLevel3Options(options);
                setNodes(options.map((str, index) => ({
                    id: index + 1,
                    name: str,
                    label: str
                })));
                setLinks([]);
                console.log('Level 3 options:', options)
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    };

    const getFilteredNetwork = async (level1, level2, level3) => {
        // const response = await fetch(`/api/getFilteredNetwork?l1=${level1}&l2=${level2}&l3=${level3}`, {
        //     method: 'GET',
        //     credentials: 'include',
        //     mode: 'cors',
        // });

        const response = await fetch(`http://localhost:9093/getFilteredNetwork?l1=${level1}&l2=${level2}&l3=${level3}`, {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
        });

        const jsonData = await response.json();
        if (jsonData == null || jsonData.nodes == null)
            return;

        const unchecked_links = jsonData.links;
        const nodeIds = jsonData.nodes.map(node => node.id);
        const filtered_links = unchecked_links.filter(link => {
            // Check if both link.source and link.target exist in the nodeIds array
            const sourceExists = nodeIds.includes(link.source);
            const targetExists = nodeIds.includes(link.target);

            return sourceExists && targetExists;
        });

        setNodes(jsonData.nodes);
        setLinks(filtered_links);
    }

    const fetchData = async () => {
        const response = await fetch('/api/getNetwork', {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
        });

        const jsonData = await response.json();
        if (jsonData == null || jsonData.nodes == null)
            return;

        const unchecked_links = jsonData.links;
        const nodeIds = jsonData.nodes.map(node => node.id);
        const filtered_links = unchecked_links.filter(link => {
            // Check if both link.source and link.target exist in the nodeIds array
            const sourceExists = nodeIds.includes(link.source);
            const targetExists = nodeIds.includes(link.target);

            return sourceExists && targetExists;
        });

        setNodes(jsonData.nodes);
        setLinks(filtered_links);
    };

    const addRelationship = async (assetId, relationships) => {
        const url = `/api/addRelationships?assetId=${assetId}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(relationships)
            });
            if (response.ok) {
                console.log('Relationship added successfully');
            } else {
                console.error('Failed to add relationship');
            }
        } catch (error) {
            console.error('Error adding relationship:', error);
        }
        fetchData();
    };

    // Part used to add a new asset

    const openModal = () => {
        setAddOpen(true);
        getAddL1Options();
    };

    const getAddL1Options = async () => {
        try {
            // const response = await fetch('/api/getLevel1', {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });
            const response = await fetch('http://localhost:9093/getLevel1', {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            if (response.ok) {
                const options = await response.json(); // Parse JSON response
                setAddL1Options(options); // Assuming options is an array of strings
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    }

    const getAddL2Options = async (level1) => {
        try {
            // const response = await fetch('/api/getLevel2?level1=${level1}', {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });
            const response = await fetch(`http://localhost:9093/getLevel2?level1=${level1}`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            if (response.ok) {
                const options = await response.json(); // Parse JSON response
                setAddL2Options(options);
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    }

    const getAddL3Options = async (level1, level2) => {
        try {
            // const response = await fetch('/api/getLevel3?level1=${level1}&level2=${level2}', {
            //     method: 'GET',
            //     credentials: 'include',
            //     mode: 'cors',
            // });
            const response = await fetch(`http://localhost:9093/getLevel3?level1=${level1}&level2=${level2}`, {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
            });

            if (response.ok) {
                const options = await response.json(); // Parse JSON response
                setAddL3Options(options);
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    }

    const handleAddAsset = async () => {
        try {
            const assetData = {
                name: name,
                label: label,
                level1: addL1,
                level2: addL2,
                level3: addL3
            };

            // const response = await fetch('/api/addAsset', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     credentials: 'include',
            //     body: JSON.stringify(assetData),
            // });
            const response = await fetch('http://localhost:9093/addAsset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(assetData),
            });

            if (response.ok) {
                // Asset added successfully, do something (e.g., close modal)
                console.log('Asset added successfully');
                handleCloseAdd(); // Close modal after successful addition
                //fetchData();
                getLevel1Options();
            } else {
                console.error('Failed to add asset');
            }
        } catch (error) {
            console.error('Error adding asset:', error);
        }
    };

    const handleCloseAdd = () => {
        setAddOpen(false);
        setAddL1('');
        setAddL2('');
        setAddL3('');
        setAddL1Options([]);
        setAddL2Options([]);
        setAddL3Options([]);
    };

    const handleLogout = () => {
        // Cancella i dati dello user dalla sessione
        sessionStorage.removeItem('userData');
        // Reindirizza l'utente alla pagina di login
        window.location.href = '/signin';
    };

    const deleteNode = async (id) => {
        try {
            const response = await fetch(`/api/deleteAsset?assetId=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                console.log('Asset deleted successfully');
                fetchData();
            } else {
                const errorMessage = await response.text();
                console.error('Failed to delete asset:', errorMessage);
                alert('Failed to delete asset: first delete the links!');
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
        }
    };

    const deleteLink = async (id) => {
        try {
            const response = await fetch(`/api/deleteRelationship?relId=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                console.log('Link deleted successfully');
                fetchData();
            } else {
                console.error('Failed to delete link');
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
        }
    };

    return (
        <CustomThemeProvider>
            <CssBaseline />
            <AppBarComponent
                pageTitle={'Assets'}
                open={open}
                toggleDrawer={toggleDrawer}
                anchorEl={anchorEl}
                handleMenu={handleMenu}
                handleClose={handleClose}
                openMenu={Boolean(anchorEl)}
                handleLogout={handleLogout}
            />
            <div style={{position: 'relative', width: '100%', height: '100%'}}>
                <DrawerComponent
                    open={open}
                    toggleDrawer={toggleDrawer}
                />
                <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                    {nodes.length > 0 ? (
                        <Graph nodes={nodes} links={links} deleteNode={deleteNode} deleteLink={deleteLink} addRelationship={addRelationship}
                               updateLevel={updateLevel} currentFilter={currentFilter}
                               style={{width: '100%', height: '100%'}}/>
                    ) : (
                        <p></p>
                    )}
                </div>
            </div>

            {/* Sequential Filter Section */}
            <Box sx={{
                position: 'absolute',
                top: '100px',
                right: '20px',
                width: '300px',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
            }}>
                <FormControl fullWidth>
                    <InputLabel>Level 1</InputLabel>
                    <Select value={level1} onChange={(e) => handleLevel1Change(e, true)}>
                        {level1Options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth disabled={!level1}>
                    <InputLabel>Level 2</InputLabel>
                    <Select value={level2} onChange={handleLevel2Change}>
                        {level2Options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth disabled={!level2}>
                    <InputLabel>Level 3</InputLabel>
                    <Select value={level3} onChange={handleLevel3Change}>
                        {level3Options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                }}
                onClick={openModal}
            >
                <AddIcon/>
            </Fab>
            {/* Dialog for adding a new asset */}
            <Dialog open={addOpen} onClose={handleCloseAdd}>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Select
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        fullWidth
                        label="Label"
                    >
                        <MenuItem value="MonitoringTarget">Monitoring Target</MenuItem>
                        <MenuItem value="Sensor">Sensor</MenuItem>
                        <MenuItem value="Gateway">Gateway</MenuItem>
                    </Select>
                    <Select
                        value={addL1}
                        onChange={(e) => {
                            setAddL1(e.target.value)
                            getAddL2Options(e.target.value);}
                        }
                        fullWidth
                        label="Level 1"
                    >
                        {addL1Options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                        <MenuItem value="new">+ Add New</MenuItem>
                        {/* Conditionally render the input field for new label */}
                        {addL1 !== '' && (
                            <div style={{ marginTop: '10px' }}>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="new-l1"
                                    label="New Level 1"
                                    type="text"
                                    fullWidth
                                    value={addL1}
                                    onChange={(e) => setAddL1(e.target.value)}
                                />
                                <Button
                                    style={{ marginTop: '10px' }}
                                    variant="contained"
                                    color="primary"
                                    onClick={getAddL2Options(addL1)}
                                >
                                    Add
                                </Button>
                            </div>
                        )}
                    </Select>
                    <Select
                        value={addL2}
                        onChange={(e) => {
                            setAddL2(e.target.value)
                            getAddL3Options(addL1, e.target.value);}
                        }
                        fullWidth
                        label="Level 2"
                    >
                        {addL2Options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        value={addL3}
                        onChange={(e) => setAddL3(e.target.value)}
                        fullWidth
                        label="Level 3"
                    >
                        {addL3Options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAdd}>Cancel</Button>
                    <Button onClick={handleAddAsset}>Add</Button>
                </DialogActions>
            </Dialog>

        </CustomThemeProvider>
    );
}

export default Assets;
