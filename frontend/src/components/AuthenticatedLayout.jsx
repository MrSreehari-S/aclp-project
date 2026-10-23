import React from "react";
import Navbar from "./Navbar";
import ArenaBackground from "./ArenaBackground";

const AuthenticatedLayout = ({ children, showNavbar = true, showGrid = true }) => {
  return (
    <ArenaBackground showGrid={showGrid}>
      {showNavbar && <Navbar />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </ArenaBackground>
  );
};

export default AuthenticatedLayout;
