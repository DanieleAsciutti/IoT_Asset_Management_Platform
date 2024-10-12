// DrawerComponent.jsx
import React from 'react';
import { Divider, List, IconButton, Toolbar } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Drawer } from './defaultTheme'; // Import the styled Drawer
import { mainListItems } from '../dashboard/listItems';

const DrawerComponent = ({ open, toggleDrawer }) => (
    <Drawer variant="permanent" open={open}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1] }}>
            <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
            </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
            {mainListItems}
            <Divider sx={{ my: 1 }} />
        </List>
    </Drawer>
);

export default DrawerComponent;
