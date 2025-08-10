
import { Routes, Route, useParams } from "react-router-dom";
import Login from "./pages/Login";
import React from 'react';

import FormList from "./pages/FormList";
import FormSubmit from "./pages/FormSubmit";
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css'

import DraggableCanvas from "./components/layout/DraggableCanvas";
import Template from "./components/layout/Template";



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

import GenerateDocxPage from "./components/GenerateDocxPage";
import UploadTemplate from "./components/UploadTemplate";
import ApplicationStatusPage from "./components/ApplicationStatusPage";

import ApplicationFormPage from "./pages/ApplicationFormPage";
import ScrapedContentDisplay from "./pages/ScrapedContentDisplay";
import PrintableApplicationForm from "./components/PrintableApplicationForm";
import FormSearch from "./pages/FormSearch";
import FormDetailForPrint from "./pages/FormDetailForPrint";
import DocxViewer from "./pages/DocxViewer";
import FormLayoutDesigner from "./pages/Admin/FormLayoutDesigner";
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import Settings from "./pages/Admin/Settings";

import Layout from "./pages/Admin/Layout";
import StudentManagementPage from "./pages/Admin/StudentManagementPage";
import DocumentViewerPage from "./pages/Student/DocumentViewerPage";
import EditFormPage from "./pages/Admin/EditFormPage";
import ShowFormPage from "./pages/Student/ShowFormPage";
import ShowFormRequest from "./pages/Admin/ShowFormRequest";
import FormDetailForDownload from "./pages/FormDetailForDownload";
// import AccountManagement from "./pages/Admin/AccountManagement";






function App() {


  return (
    <>

      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Index route for "/" */}
          <Route index element={<HomePage />} />
          <Route path="status" element={<ApplicationStatusPage />} />
          <Route path="form-user" element={<ApplicationFormPage />} />
          <Route path="show-user" element={<ShowFormPage />} />

          <Route path="forms" element={<FormList />} />
          {/* Lưu ý: ":id" và ":formID" là các tham số động */}
          <Route path="forms/:id" element={<FormDetailStudent />} />
          <Route path="forms/:formID/preview-form/:id" element={<PreviewForm />} />
          <Route path="form/submit/:type" element={<FormSubmit />} />
      <Route path="/download-form-detail/:mssv/:id/:date" element={<FormDetailForDownload />} />
          <Route path="/search" element={<FormSearch />} />
          <Route path="/show-form" element={<FormSearch />} />
         
          {/* Bạn có hai route "/forms" và "/form", có thể cân nhắc gộp lại nếu cùng mục đích */}
          <Route path="form" element={<FormListStudent />} />
          <Route path="gui" element={<SubmitApplication />} />
          <Route path="nhan" element={<ReceiveApplication />} />
        </Route>

     <Route path="/search-admin" element={<FormSearch />} />

        <Route path="/print-template/:type/:id" element={
          <div className="p-10 text-center text-2xl font-bold">
            Đây là trang in cho đơn <span className="text-blue-600">ID: {useParams().id}</span>, loại <span className="text-blue-600">{useParams().type}</span>.
            <br /><span className="text-lg font-normal text-gray-600">Bạn có thể thêm nội dung mẫu in ở đây.</span>
          </div>
        } />




        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<LayoutAdmin RequireAuth allowedRoles={['admin']} />}>
          {/* path="/" ở đây nghĩa là "/admin" */}
          <Route index element={<DashboardAdmin />} /> {/* Route mặc định cho /admin */}

          {/* Các route con, chỉ cần khai báo phần cuối của path */}
          <Route path="request" element={<ShowFormRequest />} />
          <Route path="student" element={<StudentManagementPage />} />
          <Route path="field-form" element={<CreateFieldForm />} />
          <Route path="create-layout/:id" element={<CreateLayoutForm />} />
          <Route path="form-management" element={<FormManagement />} />
          <Route path="design-layout/:formCode" element={<FormLayoutDesigner />} />
          <Route path="layout/:id" element={<Layout />} />
          <Route path="editlayout/:formId" element={<EditFormPage />} />
          <Route path="form-request" element={<FormRequest />} />
          {/* <Route path="account" element={<AccountManagement />} /> */}
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/canvas" element={<DraggableCanvas />} />
        <Route path="/template" element={<Template />} />
        <Route path="/tests" element={<DocxEditor />} />
        <Route path="/tests2" element={<GenerateDocxPage />} />
        <Route path="/tests3" element={<UploadTemplate />} />

        <Route path="/tests5" element={<ScrapedContentDisplay />} />
        <Route path="/tests6" element={<PrintableApplicationForm />} />
        <Route path="/tests7" element={<DocxViewer />} />
        <Route path="/tests8" element={<DocumentViewerPage />} />
      </Routes>
    </>
  )
}

export default App

