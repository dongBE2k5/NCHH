// src/layouts/MainLayout.jsx
import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import Navbar from "../NavbarComponent";
import { Outlet } from 'react-router-dom'; 

const MainLayout = () => {
  return (
    <>
      <Header />
       <main className="min-h-screen mx-auto px-4 sm:px-6 lg:px-0 pt-[72px]">
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
