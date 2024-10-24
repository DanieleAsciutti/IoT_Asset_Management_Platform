import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Update import statement
import SignInSide  from "./sign-in-side/SignInSide";
import Devices from "./devices/Devices.jsx";
import Assets from "./assets/Assets.jsx";
import Technician from "./technician/Technician.jsx";
import Reports from "./reports/Reports.jsx";
import DevicesWrapper from "./assetPage/DevicePage.jsx";
import AssetsWrapper from './assetPage/AssetPage.jsx';
import ManageDevices from "./manageDevices/ManageDevices.jsx";
import ManageLevels from "./manageLevels/ManageLevels.jsx";
import WarningCasePage from "./warningCases/WarningCasePage.jsx";


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
                <Route path="warningcases" element={<WarningCasePage />} />
            </Routes>
        </Router>
    );
}
export default App;
