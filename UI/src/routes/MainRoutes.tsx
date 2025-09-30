
import React from "react";
import { Navigate, RouteObject } from "react-router-dom";

// Composants
import MainLayoutWrapper from "../layouts/MainLayout/MainLayoutWrapper";
import Dashboard from "../pages/Dashboard/Dashboard";
import NotFound from "../utils/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import Process from "../pages/Process/Process";
import CQ from "../components/Process/CQ/CQ";
// import OtherProcessingPage from "../components/Process/CQ/OtherProcessingPage";
import ProcessAdmin from "../components/Process/ProcessAdmin";
import CQ_ISO from "../components/Process/CQ_ISO/CQ_ISO";

// Génération dynamique des routes à partir du menu
const childRoutes: RouteObject[] = [  
  {
    path: "/",
    element: <Navigate to="/processing" replace />,
  },
  {
    path: "dashboard",
    element: <Dashboard />,
  },
  {
    path: "processing",
    element: <Process />,
    children: [  
      { index: true, element: <ProcessAdmin /> },
      { path: "cq", element: <CQ /> },
      { path: "cq-iso", element: <CQ_ISO /> },
      // { path: "other", element: <OtherProcessingPage /> },
    ]
  },
  { path: "*", element: <NotFound /> },
];

const MainRoutes: RouteObject = {
  path: "/",
  element: (
    <ProtectedRoute>
      <MainLayoutWrapper />
    </ProtectedRoute>
  ),
  children: childRoutes,
};

export default MainRoutes;
