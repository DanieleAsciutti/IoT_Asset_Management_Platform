import React, { useState, useEffect } from 'react';
import FieldKeyDashboard from './FieldKeyDashboard.jsx';
import TimeRangePicker from './TimeRangePicker.jsx';
import dayjs from 'dayjs';
import { Button } from '@mui/material';
import FileSaver from 'file-saver';

const DeviceDataReports = ({ deviceId }) => {
    const [selectedMeasurement, setSelectedMeasurement] = useState('');
    const [metadataFetched, setMetadataFetched] = useState(false); // Nuovo stato per tracciare il successo del fetch dei metadati
    const [measurements, setMeasurements] = useState([]);
    const [buckets, setBuckets] = useState([]);
    const [fieldKeys, setFieldKeys] = useState({});
    const [timeRanges, setTimeRanges] = useState({});

    useEffect(() => {
        const fetchMeasurements = async () => {
            try {
                const response = await fetch(`/api/retrieveDeviceDataMeasurements?deviceId=${deviceId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                const measurements = await response.json();
                setMeasurements(measurements);
            } catch (error) {
                console.error('Error fetching measurements:', error);
            }
        };

        fetchMeasurements();
    }, [deviceId]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await fetch(`/api/retrieveDeviceDataMetadata?deviceId=${deviceId}&measurement=${selectedMeasurement}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();


                setBuckets(data.buckets);
                setFieldKeys(data.fieldKeys);

                const initialTimeRanges = data.buckets.reduce((acc, bucket) => {
                    const latestTimestamp = dayjs(data.latestTimestamps[bucket]);
                    const defaultFrom = latestTimestamp.subtract(30, 'minute');

                    const latestTimestampFormatted = latestTimestamp.toISOString();
                    const defaultFromFormatted = defaultFrom.toISOString();


                    acc[bucket] = {
                        from: dayjs(defaultFromFormatted),
                        to: dayjs(latestTimestampFormatted)
                    };
                    return acc;
                }, {});
                setTimeRanges(initialTimeRanges);


                setMetadataFetched(true);
            } catch (error) {
                console.error('Error fetching metadata:', error);
                setMetadataFetched(false);
            }
        };

        if (selectedMeasurement) {
            fetchMetadata();
        }
    }, [selectedMeasurement, deviceId]);

    const handleMeasurementChange = (event) => {
        setSelectedMeasurement(event.target.value);
        setMetadataFetched(false);
    };

    const handleTimeRangeChange = (bucket, range) => {
        setTimeRanges((prev) => {
            const newTimeRanges = {
                ...prev,
                [bucket]: range
            };
            return newTimeRanges;
        });
    };

    const handleDownloadData = async () => {
        try {
            const response = await fetch(`/api/downloadDeviceData?deviceId=${deviceId}`, {
                method: 'GET',
                credentials: 'include',
            });
            const blob = await response.blob();
            FileSaver.saveAs(blob, "device_data.zip");
        } catch (error) {
            console.error('Error downloading data:', error);
        }
    };

    return (
        <div>
            <Button
                variant="contained"
                color="secondary"
                onClick={handleDownloadData}
                sx={{ mt: 2 }}
            >
                DOWNLOAD DATA
            </Button>
            <div>
                <label htmlFor="measurement-select">Select Measurement: </label>
                <select id="measurement-select" value={selectedMeasurement} onChange={handleMeasurementChange}>
                    <option value="" disabled>Select a measurement</option>
                    {measurements.map((measurement, index) => (
                        <option key={index} value={measurement}>{measurement}</option>
                    ))}
                </select>
            </div>
            {metadataFetched && (
                <div>
                    {buckets.map((bucket) => (
                        <div key={bucket}>
                            <h2>{bucket}</h2>
                            <TimeRangePicker
                                bucket={bucket}
                                timeRange={timeRanges[bucket]}
                                onTimeRangeChange={handleTimeRangeChange}
                            />
                            {fieldKeys[bucket].map((fieldKey, index) => (
                                <FieldKeyDashboard
                                    key={index}
                                    fieldKey={fieldKey}
                                    deviceId={deviceId}
                                    measurement={selectedMeasurement}
                                    bucket={bucket}
                                    timeRange={timeRanges[bucket]}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeviceDataReports;
