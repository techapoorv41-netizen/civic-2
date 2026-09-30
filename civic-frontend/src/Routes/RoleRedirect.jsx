import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES, ROUTES } from "../utils/constants";
import Loader from "../components/common/Loader";

const RoleRedirect = ({ replace = true }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Redirecting to role dashboard..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace={replace} />;
  }

  if (user.role === ROLES.ADMIN) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace={replace} />;
  }

  if (user.role === ROLES.OFFICIAL) {
    return <Navigate to={ROUTES.OFFICIAL_DASHBOARD} replace={replace} />;
  }

  return <Navigate to={ROUTES.CITIZEN_HOME} replace={replace} />;
};

export default RoleRedirect;
