// ThemeProvider.jsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { defaultTheme } from './defaultTheme';

const CustomThemeProvider = ({ children }) => (
    <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        {children}
    </ThemeProvider>
);

export default CustomThemeProvider;
