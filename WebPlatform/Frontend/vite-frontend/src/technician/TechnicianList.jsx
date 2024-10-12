// TechnicianList.jsx
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogActions, DialogContent, Typography, Select, MenuItem } from '@mui/material';
import Title from '../devices/Title.jsx';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

const TechnicianList = () => {
    const [technicians, setTechnicians] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [modifiedRole, setModifiedRole] = useState('');
    const [editingRole, setEditingRole] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState('');

    useEffect(() => {
        const userDataString = sessionStorage.getItem('userData');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            const role = userData.role;
            setCurrentUserRole(role);
            console.log('Current user role:', role);

            // Chiamata a fetchDataFromDB solo se currentUserRole è stato impostato correttamente
            if (role) {
                fetchDataFromDB();
            }
        }
    }, []);

    const fetchDataFromDB = async () => {
        try {
            const response = await fetch('/api/users', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Errore nel fetch:', response.status);
                return;
            }

            const data = await response.json();
            let users = data.users;
            console.log(users);
            if (Array.isArray(users)) {
                setTechnicians(users);
            } else {
                console.error('Dati non validi:', users);
                setTechnicians([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setTechnicians([]);
        }
    };

    const handleClickOpen = (technician) => {
        setSelectedTechnician(technician);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleModify = (technician) => {
        setSelectedTechnician(technician); // Imposta il tecnico selezionato
        setModifiedRole(technician.role);
        setEditingRole(true);
    };



    const handleRoleChange = (event) => {
        setModifiedRole(event.target.value);
    };

    const handleConfirmModify = async (id, role) => {
        const cleanRole = role.replace(/'/g, ''); // Rimuovi gli apici dal ruolo
        console.log(id, cleanRole);
        try {
            const response = await fetch(`/api/updateUserRole?id=${id}&role=${cleanRole}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Ruolo utente aggiornato con successo');
                window.location.reload();
            } else {
                console.error('Errore durante l\'aggiornamento del ruolo utente:', response.status);
            }
        } catch (error) {
            console.error('Errore durante la richiesta di aggiornamento del ruolo utente:', error);
        }

        setEditingRole(false);
        setOpen(false);
    };

    const handleCancelModify = () => {
        setEditingRole(false);
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/deleteUser?id=${id}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Utente eliminato con successo');
                window.location.reload();
            } else {
                console.error('Errore durante l\'eliminazione dell\'utente:', response.status);
            }
        } catch (error) {
            console.error('Errore durante la richiesta di eliminazione utente:', error);
        }
    };

    const adminTechnicians = Array.isArray(technicians) ? technicians.filter(technician => technician.role === 'ADMIN') : [];
    const techTechnicians = Array.isArray(technicians) ? technicians.filter(technician => technician.role === 'TECHNICIAN') : [];

    return (
        <React.Fragment>
            <Title>Technicians</Title>
            {adminTechnicians.length > 0 && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={4} align="center"><strong>Admins</strong></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Username</strong></TableCell>
                                <TableCell><strong>Role</strong></TableCell>
                                <TableCell align="center"><strong>ACTIONS</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {adminTechnicians.map((technician, index) => (
                                <TableRow key={index}>
                                    <TableCell>{technician.id}</TableCell>
                                    <TableCell>{technician.username}</TableCell>
                                    <TableCell>{technician.role}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'inline-flex', gap: 1 }}>
                                            <Button variant="outlined" color="primary" onClick={() => handleClickOpen(technician)}>
                                                Details <KeyboardArrowRightIcon />
                                            </Button>
                                            {currentUserRole === 'ADMIN' && (
                                                <>
                                                    <Button variant="contained" color="error" disabled>Delete</Button>
                                                    <Button variant="contained" color="primary" disabled>Modify</Button>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {techTechnicians.length > 0 && (
                <TableContainer component={Paper} style={{ marginBottom: '16px' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={4} align="center"><strong>Technical Operators</strong></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Username</strong></TableCell>
                                <TableCell><strong>Role</strong></TableCell>
                                <TableCell align="center"><strong>ACTIONS</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {techTechnicians.map((technician, index) => (
                                <TableRow key={index + adminTechnicians.length}>
                                    <TableCell>{technician.id}</TableCell>
                                    <TableCell>{technician.username}</TableCell>
                                    <TableCell>{technician.role}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'inline-flex', gap: 1 }}>
                                            <Button variant="outlined" color="primary" onClick={() => handleClickOpen(technician)}>
                                                Details <KeyboardArrowRightIcon />
                                            </Button>
                                            {currentUserRole === 'ADMIN' && (
                                                <>
                                                    <Button variant="contained" color="error" onClick={() => handleDelete(technician.id)}>Delete</Button>
                                                    <Button variant="contained" color="primary" onClick={() => handleModify(technician)}>Modify</Button>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {adminTechnicians.length === 0 && techTechnicians.length === 0 && (
                <Typography variant="body1" align="center">No technicians available.</Typography>
            )}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    <Typography fontSize={22} color="primary" align="center"><strong>Technician Details</strong></Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body1" textAlign="right">
                                <strong>Username:</strong>
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">
                                {selectedTechnician && selectedTechnician.username}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1" textAlign="right">
                                <strong>Role:</strong>
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">
                                {selectedTechnician && selectedTechnician.role}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Grid container spacing={2} justifyContent="flex-end">
                        {currentUserRole === 'ADMIN' && selectedTechnician && selectedTechnician.role !== 'ADMIN' && (
                            <Grid item>
                                <Button onClick={() => handleModify(selectedTechnician)} color="primary" sx={{ bgcolor: '#2196f3', color: '#fff' }}>Modify</Button>
                            </Grid>

                        )}
                        <Grid item>
                            <Button onClick={handleClose} color="primary">Close</Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>

            <Dialog open={editingRole} onClose={handleClose}>
                <DialogTitle>
                    <Typography fontSize={22} color="primary" align="center"><strong>Modify Technician Role</strong></Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body1" textAlign="right">
                                <strong>Username:</strong>
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">
                                {selectedTechnician && selectedTechnician.username}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1" textAlign="right">
                                <strong>Role:</strong>
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Select value={modifiedRole} onChange={handleRoleChange} fullWidth>
                                <MenuItem value="ADMIN">ADMIN</MenuItem>
                                <MenuItem value="TECHNICIAN">TECHNICIAN</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleConfirmModify(selectedTechnician.id, modifiedRole)} color="primary">Confirm</Button>
                    <Button onClick={handleCancelModify} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

export default TechnicianList;
