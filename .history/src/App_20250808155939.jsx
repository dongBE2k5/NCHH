import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import FormList from "./pages/FormList";
import FormSubmit from "./pages/FormSubmit";
import FormStatus from "./pages/FormStatus";
import StaffDashboard from "./pages/StaffDashboard";
import SearchStudent from "./pages/SearchStudent";
import ManageForms from "./pages/ManageForms";
import Notifications from "./pages/Notifications";

function App() {
    return (
        <Routes>
            <Route path="/login" element={< Login />} />
            < Route path="/dashboard" element={< StudentDashboard />} />
            < Route path="/profile" element={< StudentProfile />} />
            < Route path="/forms" element={< FormList />} />
            < Route path="/form/submit/:type" element={<FormSubmit />} />
            < Route path="/status" element={<FormStatus />} />
            < Route path="/staff-dashboard" element={<StaffDashboard />} />
            < Route path="/search" element={<SearchStudent />} />
            < Route path="/manage-forms" element={<ManageForms />} />
            < Route path="/notifications" element={<Notifications />} />
        </Routes>
    );
}

export default App;