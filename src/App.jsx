
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
import DropAndDrop from "./pages/DropAndDrop";
import { useState } from 'react';

import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css'
import DraggableItem from "./pages/DraggableItem";
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggablePage from "./components/layout/DraggablePage";
import CrudTest from "./pages/CrudTest";
import DraggableCanvas from "./components/layout/DraggableCanvas";
import Template from "./components/layout/Template";
import ExportToWord from "./components/layout/ExportToWord ";
import MyDocument from "./components/layout/MyDocument";
import Call from "./components/layout/Call";
import MyEditor from "./components/layout/MyEditor";
import Submit from "./components/layout/Submit";





function App() {


  return (
    <>
      <Routes >
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/forms" element={<FormList />} />
        <Route path="/form/submit/:type" element={<FormSubmit />} />
        <Route path="/status" element={<FormStatus />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/search" element={<SearchStudent />} />
        <Route path="/manage-forms" element={<ManageForms />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/dropandrop" element={<DropAndDrop />} />
        <Route path="/draggableitem" element={<DraggablePage />} />
        <Route path="/crud" element={<CrudTest />} />
        <Route path="/canvas" element={<DraggableCanvas />} />
        <Route path="/template" element={<Template />} />
        <Route path="/word" element={<MyEditor />} />
        <Route path="/nhan" element={<Submit />} />

      </Routes>
    </>
  )
}

export default App
