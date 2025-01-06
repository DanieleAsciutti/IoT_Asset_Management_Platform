import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DevicesIcon from '@mui/icons-material/Devices';
import PeopleIcon from '@mui/icons-material/People';
import ReportIcon from '@mui/icons-material/Summarize';
import LayersIcon from '@mui/icons-material/Layers';
import CodeIcon from '@mui/icons-material/Code';
import PhonelinkRingIcon from '@mui/icons-material/PhonelinkRing';
import { Link as RouterLink } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import WarningIcon from '@mui/icons-material/Warning';
import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';

// @ts-ignore
export const mainListItems = (
    <React.Fragment>
        <ListItemButton component={RouterLink} to="/devices">
            <ListItemIcon>
                <DevicesIcon/>
            </ListItemIcon>
            <ListItemText primary="Devices"/>
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/technician">
            <ListItemIcon>
                <PeopleIcon/>
            </ListItemIcon>
            <ListItemText primary="Technician"/>
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/reports">
            <ListItemIcon>
                <ReportIcon/>
            </ListItemIcon>
            <ListItemText primary="Reports"/>
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/assets">
            <ListItemIcon>
                <LayersIcon/>
            </ListItemIcon>
            <ListItemText primary="Assets"/>
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/manageDevices">
            <ListItemIcon>
                <AutoAwesomeMotionIcon />
            </ListItemIcon>
            <ListItemText primary="Manage Devices"/>
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/managelevels">
            <ListItemIcon>
                <FilterListIcon />
            </ListItemIcon>
            <ListItemText primary="Manage Levels"/>
        </ListItemButton>

        <ListItemButton component={RouterLink} to="/warningcases">
            <ListItemIcon>
                <WarningIcon />
            </ListItemIcon>
            <ListItemText primary="Warning Cases"/>
        </ListItemButton>
    </React.Fragment>
);

export const secondaryListItems = (
    <React.Fragment>
        <ListSubheader component="div" inset>
            Quick Actions
        </ListSubheader>
        <ListItemButton>
            <ListItemIcon>
                <CodeIcon/>
            </ListItemIcon>
            <ListItemText primary="Add ML Model"/>
        </ListItemButton>
        <ListItemButton>
            <ListItemIcon>
                <PhonelinkRingIcon/>
            </ListItemIcon>
            <ListItemText primary="Add Device"/>
        </ListItemButton>

    </React.Fragment>
);
