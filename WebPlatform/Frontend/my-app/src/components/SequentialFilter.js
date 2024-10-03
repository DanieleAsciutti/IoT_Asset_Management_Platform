import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const SequentialFilter = ({
                              level1,
                              level2,
                              level3,
                              level1Options,
                              level2Options,
                              level3Options,
                              handleLevel1Change,
                              handleLevel2Change,
                              handleLevel3Change,
                          }) => {
    return (
        <React.Fragment>
            {/* Level 1 Filter */}
            <FormControl fullWidth>
                <InputLabel>Level 1</InputLabel>
                <Select value={level1} onChange={handleLevel1Change}>
                    {level1Options.map((option, index) => (
                        <MenuItem key={index} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Level 2 Filter */}
            <FormControl fullWidth disabled={!level1}>
                <InputLabel>Level 2</InputLabel>
                <Select value={level2} onChange={handleLevel2Change}>
                    {level2Options.map((option, index) => (
                        <MenuItem key={index} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Level 3 Filter */}
            <FormControl fullWidth disabled={!level2}>
                <InputLabel>Level 3</InputLabel>
                <Select value={level3} onChange={handleLevel3Change}>
                    {level3Options.map((option, index) => (
                        <MenuItem key={index} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </React.Fragment>
    );
};

export default SequentialFilter;
