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
       <main className="min-h-screen container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
