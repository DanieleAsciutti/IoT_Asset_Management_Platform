import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Modal } from '@mui/material';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://motusml.com//">
                MOTUS ML
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();

export default function SignInSide() {
    const [showErrorPopup, setShowErrorPopup] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const sha256 = require('crypto-js/sha256');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nickname = formData.get('email');
        const password = formData.get('password');
        const hashedPassword = sha256(password).toString();

        try {
            const response = await fetch('/api/authenticate', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username: nickname, passwordHash: hashedPassword }),
            });
            // const response = await fetch('http://localhost:9093/authenticate', {
            //     method: 'POST',
            //     credentials: 'include',
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({ username: nickname, passwordHash: hashedPassword }),
            // });
            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('userData', JSON.stringify(data));
                window.location.href = '/assets';
            } else {
                if (response.status === 401) {
                    setErrorMessage("Invalid email or password. Please try again.");
                } else {
                    setErrorMessage("An error occurred during login. Please try again later.");
                }
                setShowErrorPopup(true);
            }
        } catch (error) {
            console.error('Error during login:', error);
            setErrorMessage("An error occurred during login. Please try again later.");
            setShowErrorPopup(true);
        }
    };


    const handleCloseErrorPopup = () => {
        setShowErrorPopup(false);
    };


    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://www.mckinsey.com/~/media/mckinsey/industries/technology%20media%20and%20telecommunications/high%20tech/our%20insights/the%20future%20of%20connectivity%20enabling%20the%20internet%20of%20things/the-future-of-connectivity-1536x1536-400.jpg)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Remember me"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="#" variant="body2">
                                        Forgot password?
                                    </Link>
                                </Grid>
                            </Grid>
                            <Copyright sx={{ mt: 5 }} />
                        </Box>
                        <Modal
                            open={showErrorPopup}
                            onClose={handleCloseErrorPopup}
                            aria-labelledby="error-modal-title"
                            aria-describedby="error-modal-description"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 400,
                                bgcolor: 'background.paper',
                                boxShadow: 24,
                                p: 4,
                            }}>
                                <Typography id="error-modal-title" variant="h6" component="h2" gutterBottom>
                                    Error
                                </Typography>
                                <Typography id="error-modal-description" sx={{ mt: 2 }} variant="body1">
                                    {errorMessage}
                                </Typography>
                                <Button onClick={handleCloseErrorPopup} sx={{ mt: 2 }}>
                                    Close
                                </Button>
                            </Box>
                        </Modal>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
