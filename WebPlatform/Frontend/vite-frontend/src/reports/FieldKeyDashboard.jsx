import React, { useEffect } from 'react';
import { grafanaBaseUrl } from './constants';

const FieldKeyDashboard = ({ fieldKey, deviceId, measurement, bucket, timeRange }) => {
    const from = timeRange.from.valueOf();
    const to = timeRange.to.valueOf();
    const grafanaUrl = `${grafanaBaseUrl}${deviceId}&var-field_key=${fieldKey}&var-bucket=${bucket}&var-measurement=${measurement}&from=${from}&to=${to}&theme=light&panelId=1`;

    useEffect(() => {
        console.log(`Grafana URL for fieldKey ${fieldKey}, bucket ${bucket}: ${grafanaUrl}`);
    }, [grafanaUrl, fieldKey, bucket]);

    return (
        <div style={{ marginBottom: '20px' }}>
            <h3>{fieldKey}</h3>
            <iframe
                src={grafanaUrl}
                frameBorder="0"
                style={{ width: '100%', height: '600px', border: 'none' }}
                allowFullScreen
            />
        </div>
    );
};

export default FieldKeyDashboard;
