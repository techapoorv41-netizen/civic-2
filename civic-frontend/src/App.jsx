import React from "react";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-govLight text-govText font-sans antialiased selection:bg-govOrange selection:text-white">
      <Navbar />
      <div className="flex-1">
        <AppRoutes />
      </div>
      <Footer />
    </div>
  );
}

export default App;