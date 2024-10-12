import React from 'react';
import './SimpleTooltip.css'; // Add some basic styling

const SimpleTooltip = ({ x, y, label }) => {
    return (
        <div className="simple-tooltip" style={{left: x, top: y}}>
            <span className="emphasized">{label}</span>
        </div>
    );
};

export default SimpleTooltip;
