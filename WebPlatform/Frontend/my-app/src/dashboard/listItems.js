import * as React from 'react';
import { Link } from 'react-router-dom'; // Assicurati di importare Link da react-router-dom
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';

import PeopleIcon from '@mui/icons-material/People';
import LayersIcon from '@mui/icons-material/Layers';
import CodeIcon from "@mui/icons-material/Code";
import PhonelinkRingIcon from "@mui/icons-material/PhonelinkRing";
import DevicesIcon from "@mui/icons-material/Devices";
import ReportIcon from "@mui/icons-material/Summarize";
import PodcastsIcon from '@mui/icons-material/Podcasts';

export const mainListItems = (
    <React.Fragment>
        <ListItemButton component={Link} to="/devices"> {/* Aggiungi il componente Link */}
            <ListItemIcon>
                <DevicesIcon/>
            </ListItemIcon>
            <ListItemText primary="Devices"/>
        </ListItemButton>
        <ListItemButton component={Link} to="/technician"> {/* Aggiungi il componente Link */}
            <ListItemIcon>
                <PeopleIcon/>
            </ListItemIcon>
            <ListItemText primary="Technician"/>
        </ListItemButton>
        <ListItemButton component={Link} to="/reports"> {/* Aggiungi il componente Link */}
            <ListItemIcon>
                <ReportIcon/>
            </ListItemIcon>
            <ListItemText primary="Reports"/>
        </ListItemButton>
        <ListItemButton component={Link} to="/assets"> {/* Aggiungi il componente Link */}
            <ListItemIcon>
                <LayersIcon/>
            </ListItemIcon>
            <ListItemText primary="Assets"/>
        </ListItemButton>
        <ListItemButton component={Link} to="/managedevices">
            <ListItemIcon>
                <PodcastsIcon />
            </ListItemIcon>
            <ListItemText primary="Manage Devices"/>
        </ListItemButton>
    </React.Fragment>
);

export const secondaryListItems = (
    <React.Fragment>
        <ListSubheader component="div" inset>
            Quick Actions
        </ListSubheader>
        <ListItemButton component={Link} to="/add-ml-model"> {/* Aggiungi il componente Link */}
            <ListItemIcon>
                <CodeIcon/>
            </ListItemIcon>
            <ListItemText primary="Add ML Model"/>
        </ListItemButton>
        <ListItemButton component={Link} to="/add-device"> {/* Aggiungi il componente Link */}
            <ListItemIcon>
                <PhonelinkRingIcon/>
            </ListItemIcon>
            <ListItemText primary="Add Device"/>
        </ListItemButton>
    </React.Fragment>
);
