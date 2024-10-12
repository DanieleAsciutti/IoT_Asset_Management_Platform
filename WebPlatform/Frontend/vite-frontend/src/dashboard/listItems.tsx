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

export const mainListItems = (
    <React.Fragment>
        <ListItemButton>
            <ListItemIcon>
                <DevicesIcon/>
            </ListItemIcon>
            <ListItemText primary="Devices"/>
        </ListItemButton>
        <ListItemButton>
            <ListItemIcon>
                <PeopleIcon/>
            </ListItemIcon>
            <ListItemText primary="Technician"/>
        </ListItemButton>
        <ListItemButton>
            <ListItemIcon>
                <ReportIcon/>
            </ListItemIcon>
            <ListItemText primary="Reports"/>
        </ListItemButton>
        <ListItemButton>
            <ListItemIcon>
                <LayersIcon/>
            </ListItemIcon>
            <ListItemText primary="Assets"/>
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
