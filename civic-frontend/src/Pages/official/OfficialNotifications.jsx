import React from "react";
import Notifications from "../citizen/Notifications";
import Sidebar from "../../components/common/Sidebar";

const OfficialNotifications = () => {
  return (
    <div className="flex min-h-screen bg-govLight">
      <Sidebar />
      <main className="flex-1">
        <Notifications />
      </main>
    </div>
  );
};

export default OfficialNotifications;
