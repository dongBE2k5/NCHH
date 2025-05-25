
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

import { useState } from 'react';

import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css'
import DraggableItem from "./pages/DraggableItem";
import { HTML5Backend } from 'react-dnd-html5-backend';
import CrudTest from "./pages/CrudTest";
import DraggableCanvas from "./components/layout/DraggableCanvas";
import Template from "./components/layout/Template";
import ExportToWord from "./components/layout/ExportToWord ";
import MyDocument from "./components/layout/MyDocument";
import Call from "./components/layout/Call";

import SubmitApplication from "./components/layout/SubmitApplication";
import ReceiveApplication from "./components/layout/ReceiveApplication";

import HomePage from "./pages/HomePage";
import FormListStudent from "./pages/Student/FormListStudent";
import FormDetailStudent from "./pages/Student/FormDetailStudent";
import MainLayout from "./components/layout/MainLayout";
import CreateFieldForm from "./pages/Admin/CreateFieldForm";
import PreviewForm from "./pages/PreviewForm";
import CreateLayoutForm from "./pages/Admin/CreateLayoutForm";
import LayoutAdmin from "./components/LayoutAdmin";
import FormManagement from "./pages/Admin/FormManagement";






function App() {


  return (
    <>
      <Routes >
      <Route path="/" element={<MainLayout> <HomePage /> </MainLayout> } />
      <Route path="/forms/:id" element={<MainLayout>  <FormDetailStudent /> </MainLayout> } />
      <Route path="/preview-form/:id" element={<MainLayout>  <PreviewForm /> </MainLayout> } />
      <Route path="/admin/forms" element={<LayoutAdmin>  <CreateFieldForm /> </LayoutAdmin> } />
      <Route path="/admin/create-layout/:id" element={<LayoutAdmin>  <CreateLayoutForm /> </LayoutAdmin> } />
      <Route path="/admin/form-management" element={<LayoutAdmin>  <FormManagement /> </LayoutAdmin> } />
      <Route path="/admin" element={<LayoutAdmin />} />
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


        <Route path="/crud" element={<CrudTest />} />
        <Route path="/canvas" element={<DraggableCanvas />} />
        <Route path="/template" element={<Template />} />

        <Route path="/gui" element={<SubmitApplication />} />
            <Route path="/nhan" element={<ReceiveApplication />} />
            <Route path="/form" element={<FormListStudent />} />

      </Routes>
    </>
  )
}

export default App

// import React, { useState } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Home from './pages/pages/Home';
// import StudentManagement from './pages/pages/StudentManagement';
// import FormManagement from './pages/pages/FormManagement';
// import EditForm from './pages/pages/EditForm';
// import Report from './pages/pages/Report';

// function App() {
//   const [students, setStudents] = useState([
//     { id: 1, name: "Nguyen Van A", studentId: "SV001", class: "CNTT1" },
//     { id: 2, name: "Tran Thi B", studentId: "SV002", class: "CNTT2" },
//   ]);
//   const [forms, setForms] = useState([
//     {
//       id: 1746341708333,
//       type: "dynamicGrid",
//       left: 0,
//       top: 218,
//       rows: 3,
//       columns: 2,
//       columnRatios: [""],
//       nestedConfig: {},
//       value: ["13", "23", "33", "43", "53", "63"],
//       studentId: "SV001",
//       status: "Chờ xử lý",
//     },
//     {
//       id: 1746341723333,
//       type: "studentForm",
//       left: 0,
//       top: 307,
//       data: { name: "Nguyen Van A", request: "Xin nghỉ học" },
//       studentId: "SV001",
//       status: "Đã duyệt",
//     },
//   ]);

//   const addStudent = (newStudent) => {
//     setStudents((prev) => [...prev, newStudent]);
//   };

//   const updateStudent = (updatedStudent) => {
//     setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
//   };

//   const deleteStudent = (id) => {
//     setStudents((prev) => prev.filter((s) => s.id !== id));
//   };

//   const addForm = (newForm) => {
//     setForms((prev) => [...prev, newForm]);
//   };

//   const updateForm = (updatedForm) => {
//     setForms((prev) => prev.map((f) => (f.id === updatedForm.id ? updatedForm : f)));
//   };

//   const deleteForm = (id) => {
//     setForms((prev) => prev.filter((f) => f.id !== id));
//   };

//   return (
//     <Router>
//       <div className="min-h-screen bg-academic-gray">
//         <Navbar />
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/students" element={<StudentManagement students={students} addStudent={addStudent} updateStudent={updateStudent} deleteStudent={deleteStudent} />} />
//           <Route path="/forms" element={<FormManagement forms={forms} addForm={addForm} updateForm={updateForm} deleteForm={deleteForm} />} />
//           <Route path="/edit-form/:id" element={<EditForm forms={forms} updateForm={updateForm} />} />
//           <Route path="/reports" element={<Report />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;