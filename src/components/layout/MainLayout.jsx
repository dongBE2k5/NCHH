// src/layouts/MainLayout.jsx
import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import Navbar from "../NavbarComponent";

const MainLayout = ({ children }) => {
  return (
    <>
      {/* <Navbar userType="student" /> */}
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;
