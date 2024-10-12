import React from 'react';
import './Tooltip.css'; // Import CSS for tooltip styling

const Tooltip = React.forwardRef(({ data, x, y }, ref) => {
    const tooltipStyle = {
        position: 'absolute',
        top: `${y}px`,
        left: `${x}px`,
    };

    return (
        <div ref={ref}className="tooltip" style={tooltipStyle}>
            <h3>{data.name}</h3>
            <p>Label: {data.label}</p>
            {/*<p>ID: {data.id}</p>*/}
            <p>Place: {data.place}</p>
            <p>Type: {data.type}</p>
        </div>
    );
});

export default Tooltip;
