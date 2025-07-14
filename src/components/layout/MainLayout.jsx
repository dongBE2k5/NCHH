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
       <main>
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
