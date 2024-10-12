// MainContent.jsx
import React from 'react';
import { Box, Toolbar, Container, Grid, Paper, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import TechnicianList from './TechnicianList.jsx';

const MainContent = ({ currentUserRole, newUser, handleInputChange, handleAddUser, allFieldsFilled }) => (
    <Box component="main" sx={{ backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900], flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8} lg={9}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <TechnicianList />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                    {currentUserRole === 'ADMIN' && (
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>
                                <strong>Add New User</strong>
                            </Typography>
                            <TextField name="username" label="Username" variant="outlined" margin="normal" value={newUser.username} onChange={handleInputChange} />
                            <TextField name="password" label="Password" type="password" variant="outlined" margin="normal" value={newUser.password} onChange={handleInputChange} />
                            <FormControl variant="outlined" margin="normal">
                                <InputLabel id="role-label">Role</InputLabel>
                                <Select labelId="role-label" name="role" value={newUser.role} onChange={handleInputChange} label="Role">
                                    <MenuItem value="ADMIN">Admin</MenuItem>
                                    <MenuItem value="TECHNICIAN">Technician</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" color="primary" onClick={handleAddUser} sx={{ mt: 2 }} disabled={!allFieldsFilled}>
                                Aggiungi
                            </Button>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Container>
    </Box>
);

export default MainContent;
