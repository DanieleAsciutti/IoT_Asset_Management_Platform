import React from 'react';
import { Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Avatar, Stack } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import adminAvatar from '../img/admin.png'; // Importa l'immagine dell'avatar
import { AppBar } from './defaultTheme';

import technicianIcon from '../img/technician.png'; // Importa l'immagine del tecnico

const AccountsMenuItem = () => (
    <MenuItem component={RouterLink} to="/technician">
        <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar alt="Technician Icon" src={technicianIcon} /> {/* Utilizza l'immagine come icona */}
            <Typography variant="body1">Users</Typography>
        </Stack>
    </MenuItem>
);


const LogoutMenuItem = ({ handleLogout }) => (
    <MenuItem onClick={handleLogout}>
        <Stack direction="row" alignItems="center" spacing={1}>
            <ExitToAppIcon fontSize="small" /> {/* Icona per il logout */}
            <Typography variant="body1">Logout</Typography>
        </Stack>
    </MenuItem>
);


const AppBarComponent = ({ pageTitle, open, toggleDrawer, handleMenu, handleClose, handleLogout, anchorEl, openMenu, notificationsCount }) => (
    <AppBar position="absolute" open={open}>
        <Toolbar sx={{ pr: '24px' }}>
            <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={toggleDrawer} sx={{ marginRight: '36px', ...(open && { display: 'none' }) }}>
                <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
                {pageTitle}
            </Typography>
            <IconButton color="inherit">
                <Badge badgeContent={notificationsCount} color="secondary">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <IconButton aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleMenu} color="inherit">
                <Avatar alt="User Avatar" src={adminAvatar} />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={openMenu}
                onClose={handleClose}
            >
                <AccountsMenuItem />
                <LogoutMenuItem handleLogout={handleLogout} />
            </Menu>
        </Toolbar>
    </AppBar>
);

export default AppBarComponent;
