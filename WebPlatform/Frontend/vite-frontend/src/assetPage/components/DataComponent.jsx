import React, {useEffect, useState} from 'react';
import { Grid, Typography, Button } from '@mui/material';
import DeviceDataReports from "../../reports/DeviceDataReports.jsx";
import Box from "@mui/material/Box";

const DataComponent = ({ pendingData, hasData, handleReceiveData, deviceId, measurements }) => {

    const [pending, setPending] = useState(false);
    useEffect(() => {
        setPending(pendingData);
        console.log("setto pending: ", pendingData);
    }, [pendingData]);

    return (
        <Grid item xs={12}>
            <h1>Device Data</h1>

            {/* Check if there's no pending data request */}
            { !pending ? (
                <Button variant="contained" color="primary" onClick={handleReceiveData}>
                    New Data Request
                </Button>
            ) : (
                <div>
                    <Typography variant="h6" color="error">
                        Pending Request
                    </Typography>
                </div>
            )}

            {/* Check if data is available */}
            { !hasData ? (
                <Typography variant="body1" color="textSecondary">
                    No data available, please request or wait for new data
                </Typography>
            ) : (
                <DeviceDataReports deviceId={deviceId} measurements={measurements} />
            )}
        </Grid>
        // <Box sx={{ maxWidth: '100%', maxHeight: '500px', p: 2 }}>
        //     {/* Title */}
        //     <Typography variant="h4" component="h1" gutterBottom>
        //         Device Data
        //     </Typography>
        //
        //     {/* Check if there's no pending data request */}
        //     {!pending ? (
        //         <Button variant="contained" color="primary" onClick={handleReceiveData} sx={{ mb: 2, width: '30%' }}>
        //             New Data Request
        //         </Button>
        //     ) : (
        //         <Box sx={{ mb: 2 }}>
        //             <Typography variant="h6" color="error">
        //                 Pending Request
        //             </Typography>
        //         </Box>
        //     )}
        //
        //     {/* Check if data is available */}
        //     {!hasData ? (
        //         <Typography variant="body1" color="textSecondary">
        //             No data available, please request or wait for new data.
        //         </Typography>
        //     ) : (
        //         <Box sx={{ mt: 2 }}>
        //             <DeviceDataReports deviceId={deviceId} measurements={measurements} />
        //         </Box>
        //     )}
        // </Box>
    );
};

export default DataComponent;
