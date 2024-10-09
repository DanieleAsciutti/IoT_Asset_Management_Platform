import React, { useState, useEffect } from 'react';
import CustomThemeProvider from '../components/ThemeProvider';
import AppBarComponent from '../components/AppBarComponent';
import DrawerComponent from '../components/DrawerComponent';
import MainContent from './MainContent';
import Box from '@mui/material/Box';
import sha256 from 'crypto-js/sha256';
import technicianImage from '../img/technician.png'; // Importa l'immagine del tecnico

const Technician = () => {
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState('');

    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: ''
    });
    const [allFieldsFilled, setAllFieldsFilled] = useState(false);

    useEffect(() => {
        const userDataString = sessionStorage.getItem('userData');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            setCurrentUserRole(userData.role);
        }
        setCurrentUserRole('ADMIN');
        const fieldsFilled = Object.values(newUser).every(value => value !== '');
        setAllFieldsFilled(fieldsFilled);
    }, [newUser]);

    const toggleDrawer = () => {
        setOpen(prevOpen => !prevOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const openMenu = Boolean(anchorEl);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewUser(prevUser => ({
            ...prevUser,
            [name]: value
        }));
    };

    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        window.location.href = '/signin';
    };

    const handleAddUser = async () => {
        const { username, password, role } = newUser;
        const hashedPassword = sha256(password).toString();
        try {
            const response = await fetch('/api/addUser', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: hashedPassword,
                    role: role
                })
            });

            if (response.ok) {
                console.log('New user added successfully!');
                window.location.reload();
                setNewUser({
                    username: '',
                    password: '',
                    role: ''
                });
            } else {
                console.error('Error adding user:', response.status);
            }
        } catch (error) {
            console.error('Error requesting to add user:', error);
        }
    };

    const userDataString = sessionStorage.getItem('userData');
    const userData = JSON.parse(userDataString);

    // Check if user data exists
    if (!userData) {
        // Redirect to sign-in page if user data is not present
        window.location.href = '/';
    }

    return (
        <CustomThemeProvider>
            <Box sx={{ display: 'flex' }}>
                <AppBarComponent
                    pageTitle={'Technician'}
                    open={open}
                    toggleDrawer={toggleDrawer}
                    handleMenu={handleMenu}
                    handleClose={handleClose}
                    handleLogout={handleLogout}
                    anchorEl={anchorEl}
                    openMenu={openMenu}
                />
                <DrawerComponent open={open} toggleDrawer={toggleDrawer} />
                <MainContent
                    currentUserRole={currentUserRole}
                    newUser={newUser}
                    handleInputChange={handleInputChange}
                    handleAddUser={handleAddUser}
                    allFieldsFilled={allFieldsFilled}
                />
                <img
                    src={technicianImage}
                    alt="Technician Background"
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        right: 0,
                        zIndex: 0,
                        maxWidth: '15%',
                        maxHeight: '75%',
                        height: 'auto'
                    }}
                />
            </Box>
        </CustomThemeProvider>
    );
};

export default Technician;
