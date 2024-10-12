import React, { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Button, TextField } from '@mui/material';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

const TimeRangePicker = ({ bucket, timeRange, onTimeRangeChange }) => {
    const [from, setFrom] = useState(timeRange.from);
    const [to, setTo] = useState(timeRange.to);

    const handleApplyClick = () => {
        if (from.isSameOrBefore(to)) {
            onTimeRangeChange(bucket, { from, to });
        }
    };

    return (
        <div>
            <DateTimePicker
                label="From"
                value={from}
                onChange={setFrom}
                renderInput={(params) => <TextField {...params} />}
            />
            <DateTimePicker
                label="To"
                value={to}
                onChange={setTo}
                renderInput={(params) => <TextField {...params} />}
            />
            <Button
                onClick={handleApplyClick}
                variant="contained"
                color="primary"
                disabled={!from.isSameOrBefore(to)}
            >
                ENTER
            </Button>
        </div>
    );
};

export default TimeRangePicker;
