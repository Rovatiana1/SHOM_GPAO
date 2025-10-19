
import React from "react";
import { Navigate, RouteObject } from "react-router-dom";

// Composants
import MainLayoutWrapper from "../layouts/MainLayout/MainLayoutWrapper";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import NotFound from "../utils/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import Process from "../pages/Process/Process";
import CQ from "../components/Process/CQ/CQ";
// import OtherProcessingPage from "../components/Process/CQ/OtherProcessingPage";
import ProcessAdmin from "../components/Process/ProcessAdmin";
import CQ_ISO from "../components/Process/CQ_ISO/CQ_ISO";
import AdminPage from "../pages/Admin/AdminPage";
import UserManagement from "../components/Admin/UserManagement";
import DossierManagement from "../components/Admin/DossierManagement";
import EtapeManagement from "../components/Admin/EtapeManagement";
import EtatManagement from "../components/Admin/EtatManagement";
import LotClientManagement from "../components/Admin/LotClientManagement";
import LotManagement from "../components/Admin/LotManagement";
import LdtManagement from "../components/Admin/LdtManagement";
import RepriseCQ from "../components/Process/RepriseCQ/RepriseCQ";
import SAISIE from "../components/Process/SAISIE/SAISIE";

// Génération dynamique des routes à partir du menu
const childRoutes: RouteObject[] = [  
  {
    path: "/",
    element: <Navigate to="/processing" replace />,
  },
  {
    path: "processing",
    element: <Process />,
    children: [  
      { index: true, element: <ProcessAdmin /> },
      { path: "cq", element: <CQ /> },
      { path: "cq-iso", element: <CQ_ISO /> },
      { path: "reprise-cq", element: <RepriseCQ /> },
      { path: "saisie", element: <SAISIE /> },
      // { path: "other", element: <OtherProcessingPage /> },
    ]
  },
  {
    path: "admin",
    element: <AdminPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      { path: "users", element: <UserManagement /> },
      { path: "dossiers", element: <DossierManagement /> },
      { path: "etapes", element: <EtapeManagement /> },
      { path: "etats", element: <EtatManagement /> },
      { path: "lot-clients", element: <LotClientManagement /> },
      { path: "lots", element: <LotManagement /> },
      { path: "ldts", element: <LdtManagement /> },
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