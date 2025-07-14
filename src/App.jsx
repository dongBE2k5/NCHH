
import { Routes, Route, useParams } from "react-router-dom";
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
import FormRequest from "./pages/FormRequest";
import DocxEditor from "./components/DocxEditor";
import OnlyOfficeViewer from './components/OnlyOfficeViewer';
import GenerateDocxPage from "./components/GenerateDocxPage";
import UploadTemplate from "./components/UploadTemplate";
import ApplicationStatusPage from "./components/ApplicationStatusPage";
import WordViewer from "./components/WordViewer";
import ApplicationFormPage from "./pages/ApplicationFormPage";
import ScrapedContentDisplay from "./pages/ScrapedContentDisplay";
import PrintableApplicationForm from "./components/PrintableApplicationForm";
import FormSearch from "./pages/FormSearch";
import FormDetailForPrint from "./pages/FormDetailForPrint";
import DocxViewer from "./pages/DocxViewer";
import FormLayoutDesigner from "./pages/Admin/FormLayoutDesigner";
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import Settings from "./pages/Admin/Settings";
import RequireAuth from "./pages/Admin/RequireAuth";
import Layout from "./pages/Admin/Layout";
import StudentManagementPage from "./pages/Admin/StudentManagementPage";






function App() {


  return (
    <>

      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Index route for "/" */}
          <Route index element={<HomePage />} />
          <Route path="status" element={<ApplicationStatusPage />} />
          <Route path="form-user" element={<ApplicationFormPage />} />

          <Route path="forms" element={<FormList />} />
          {/* Lưu ý: ":id" và ":formID" là các tham số động */}
          <Route path="forms/:id" element={<FormDetailStudent />} />
          <Route path="forms/:formID/preview-form/:id" element={<PreviewForm />} />
          <Route path="form/submit/:type" element={<FormSubmit />} />
          {/* Bạn có hai route "/forms" và "/form", có thể cân nhắc gộp lại nếu cùng mục đích */}
          <Route path="form" element={<FormListStudent />} />
          <Route path="gui" element={<SubmitApplication />} />
          <Route path="nhan" element={<ReceiveApplication />} />
        </Route>

        {/* --- Authentication Routes --- */}


        {/* --- Student Routes (consider nested routes for dashboard for better structure) --- */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/profile" element={<StudentProfile />} />

        {/* --- Staff Routes (consider nested routes for dashboard) --- */}
        <Route path="/staff-dashboard" element={<StaffDashboard />} />


        {/* Route giả lập cho trang in từng loại đơn */}
        <Route path="/print-template/:type/:id" element={
          <div className="p-10 text-center text-2xl font-bold">
            Đây là trang in cho đơn <span className="text-blue-600">ID: {useParams().id}</span>, loại <span className="text-blue-600">{useParams().type}</span>.
            <br /><span className="text-lg font-normal text-gray-600">Bạn có thể thêm nội dung mẫu in ở đây.</span>
          </div>
        } />
        
        <Route path="/manage-forms" element={<ManageForms />} />
        <Route path="/notifications" element={<Notifications />} />
        

        <Route path="/search" element={<FormSearch />} />
        <Route path="/print-form-detail/:mssv/:id/:date" element={<FormDetailForPrint />} />


        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<LayoutAdmin RequireAuth allowedRoles={['admin']} />}>
          {/* path="/" ở đây nghĩa là "/admin" */}
          <Route index element={<DashboardAdmin />} /> {/* Route mặc định cho /admin */}

          {/* Các route con, chỉ cần khai báo phần cuối của path */}
          <Route path="student" element={<StudentManagementPage />} />
          <Route path="forms" element={<CreateFieldForm />} />
          <Route path="create-layout/:id" element={<CreateLayoutForm />} />
          <Route path="form-management" element={<FormManagement />} />
          <Route path="design-layout/:formCode" element={<FormLayoutDesigner />} />
          <Route path="layout/:id" element={<Layout />} />
          <Route path="form-request" element={<FormRequest />} />
          <Route path="settings" element={<Settings />} />

        </Route>



        <Route path="/crud" element={<CrudTest />} />
        <Route path="/canvas" element={<DraggableCanvas />} />
        <Route path="/template" element={<Template />} />
        <Route path="/tests" element={<DocxEditor />} />
        <Route path="/tests2" element={<GenerateDocxPage />} />
        <Route path="/tests3" element={<UploadTemplate />} />

        <Route path="/tests5" element={<ScrapedContentDisplay />} />
        <Route path="/tests6" element={<PrintableApplicationForm />} />
        <Route path="/tests7" element={<DocxViewer />} />
      </Routes>
    </>
  )
}

export default App

