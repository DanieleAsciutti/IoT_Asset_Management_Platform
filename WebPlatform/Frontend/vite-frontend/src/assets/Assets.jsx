import React, { useEffect, useState } from 'react';
import Graph from "../components/Graph";
import { CssBaseline, Box, MenuItem, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select} from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import CustomThemeProvider from '../components/ThemeProvider.jsx';
import AppBarComponent from '../components/AppBarComponent.jsx';
import DrawerComponent from '../components/DrawerComponent.jsx';
import SequentialFilter from "../components/SequentialFilter.jsx";
import LevelSelect from "../manageLevels/LevelSelect.jsx";

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

    const [newL1DialogOpen, setNewL1DialogOpen] = useState(false);
    const [newL1, setNewL1] = useState('');

    const [newL2DialogOpen, setNewL2DialogOpen] = useState(false);
    const [newL2, setNewL2] = useState('');

    const [newL3DialogOpen, setNewL3DialogOpen] = useState(false);
    const [newL3, setNewL3] = useState('');

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

    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        window.location.href = '/signin';
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
                setLevel1Options([]);
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
        const response = await fetch(`/api/getFilteredNetwork?l1=${level1}&l2=${level2}&l3=${level3}`, {
            method: 'GET',
            credentials: 'include',
            mode: 'cors',
        });

        // const response = await fetch(`http://localhost:9093/getFilteredNetwork?l1=${level1}&l2=${level2}&l3=${level3}`, {
        //     method: 'GET',
        //     credentials: 'include',
        //     mode: 'cors',
        // });

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

    const addRelationship = async (assetId, relationships) => {
        const url = `/api/addRelationships?assetId=${assetId}`;
        // const url = `http://localhost:9093/addRelationships?assetId=${assetId}`;
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
        //fetchData();
        getFilteredNetwork(level1, level2, level3);
    };


    // Part used to add a new asset
    const openModal = () => {
        setAddOpen(true);

        // setup the level options
        setAddL1(level1);
        setAddL2(level2);
        setAddL3(level3);
        setAddL2Options(level2Options);
        setAddL3Options(level3Options);

        getAddL1Options();
    };

    const getAddL1Options = async () => {
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
                setAddL3Options(options);
            } else {
                console.error('Failed to fetch Level 1 options');
            }
        } catch (error) {
            console.error('Error fetching Level 1 options:', error);
        }
    }

    const handleRefreshAfterAdd = async () => {
        if (currentFilter === 'l1') {
            getLevel1Options();
        } else if (currentFilter === 'l2') {
            getLevel2Options(level1);
        } else if (currentFilter === 'l3') {
            getLevel3Options(level1, level2);
        } else if (currentFilter === 'filtered'){
            getFilteredNetwork(level1, level2, level3);
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

            const response = await fetch('/api/addAsset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(assetData),
            });
            // const response = await fetch('http://localhost:9093/addAsset', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     credentials: 'include',
            //     body: JSON.stringify(assetData),
            // });

            if (response.ok) {
                // Asset added successfully, do something (e.g., close modal)
                console.log('Asset added successfully');
                handleCloseAdd(); // Close modal after successful addition
                //getFilteredNetwork(level1, level2, level3);
                handleRefreshAfterAdd();
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
        setName('');
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
            // const response = await fetch(`http://localhost:9093/deleteAsset?assetId=${id}`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     credentials: 'include',
            // });

            if (response.ok) {
                console.log('Asset deleted successfully');

                if (currentFilter === 'filtered' && nodes.length > 1) {
                    getFilteredNetwork(level1, level2, level3);
                } else {
                    if (level3Options.length > 1) {
                        setCurrentFilter('l3');
                        setLevel3('');
                        getLevel3Options(level1, level2);
                    } else if (level2Options.length > 1) {
                        setCurrentFilter('l2');
                        setLevel3('');
                        setLevel2('');
                        getLevel2Options(level1);
                    } else {
                        setCurrentFilter('l1');
                        setLevel3('');
                        setLevel2('');
                        setLevel1('');
                        getLevel1Options();
                    }
                }


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
            // const response = await fetch(`http://localhost:9093/deleteRelationship?relId=${id}`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     credentials: 'include',
            // });

            if (response.ok) {
                console.log('Link deleted successfully');
                getFilteredNetwork(level1, level2, level3);
            } else {
                console.error('Failed to delete link');
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
        }
    };


    const handleAddL1Change = (e) => {
        setAddL1(e);
        getAddL2Options(e);
    }

    const handleAddL2Change = (e) => {
        setAddL2(e);
        getAddL3Options(addL1, e);
    }

    const handleAddL3Change = (e) => {
        setAddL3(e);
    }

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

                    {/*Level1 Options and new dialog*/}
                    <LevelSelect label={'Level1'} value={level1} levelOptions={addL1Options} setLevel={handleAddL1Change} undisable={true} />

                    {/*Level2 Options and new dialog*/}
                    <LevelSelect label={'Level2'} value={level2} levelOptions={addL2Options} setLevel={handleAddL2Change} undisable={addL1}/>

                    {/*Level3 Options and new dialog*/}
                    <LevelSelect label={'Level3'} value={level3} levelOptions={addL3Options} setLevel={handleAddL3Change} undisable={addL2}/>

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
