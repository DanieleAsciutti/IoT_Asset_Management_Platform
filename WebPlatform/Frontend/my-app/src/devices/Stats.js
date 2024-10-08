import React from 'react';

const Stats = ({ registeredDevices, unregisteredDevices }) => {
    return (
        <div>
            <h2>Statistics</h2>
            <p>Registered devices: {registeredDevices}</p>
            <p>Unregistered devices: {unregisteredDevices}</p>
        </div>
    );
};

export default Stats;