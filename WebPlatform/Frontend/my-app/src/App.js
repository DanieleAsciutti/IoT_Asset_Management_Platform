import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Update import statement
import './App.css';
import SignInSide  from "./sign-in-side/SignInSide";
import Devices from "./devices/Devices";
import Assets from "./assets/Assets";
import Technician from "./technician/Technician";
import Reports from "./reports/Reports";
import DevicesWrapper from "./devices/DevicePage";
import AssetsWrapper from './devices/AssetPage';
import ManageDevices from "./manageDevices/ManageDevices";
import ManageLevels from "./manageLevels/ManageLevels";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<SignInSide  />} />
                <Route path="/signin" element={<SignInSide />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/technician" element={<Technician />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/devices/:id" element={<DevicesWrapper/>} />
                <Route path="/assets/:id" element={<AssetsWrapper/>}/>
                <Route path="/managedevices" element={<ManageDevices />}/>
                <Route path="/managelevels" element={<ManageLevels />}/>
            </Routes>
        </Router>
    );
}
export default App;