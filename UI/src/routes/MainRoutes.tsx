
import React from "react";
import { RouteObject } from "react-router-dom";

// Composants
import MainLayoutWrapper from "../components/Layouts/MainLayout/MainLayoutWrapper";
import Dashboard from "../pages/Dashboard/Dashboard";
import NotFound from "../utils/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import Configuration from "../pages/Configuration/Configuration";
import Manage from "../pages/Manage/Manage";
import Process from "../pages/Process/Process";
import CQ from "../components/Process/CQ/CQ";
// import OtherProcessingPage from "../components/Process/CQ/OtherProcessingPage";
import ProcessAdmin from "../components/Process/ProcessAdmin";

// Génération dynamique des routes à partir du menu
const childRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Process />,
    children: [  
      { index: true, element: <ProcessAdmin /> },
      { path: "cq", element: <CQ /> },
      // { path: "other", element: <OtherProcessingPage /> },
    ]
  },
  {
    path: "dashboard",
    element: <Dashboard />,
  },
  {
    path: "configuration",
    element: <Configuration />,
  },
  {
    path: "manage",
    element: <Manage />,
  },
  {
    path: "processing",
    element: <Process />,
    children: [  
      { index: true, element: <ProcessAdmin /> },
      { path: "cq", element: <CQ /> },
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
