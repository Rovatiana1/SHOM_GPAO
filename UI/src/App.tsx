import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes"; // Fournit la gestion des thèmes à l'application

import Routes from "./routes/Routes";
import env from "./config/env";

// Typage explicite du composant
const App: React.FC = () => {
  // Affiche un message de bienvenue dans la console pour l'environnement de développement
  console.log("WELCOME GUYS 🙂");

  return (
    // Fournit des thèmes à l'application via le composant ThemeProvider
    <ThemeProvider attribute="class">
      <div className="w-full">
        <BrowserRouter basename={`/${env.PREFIXE_URL}`}>
          <Routes />
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
};

export default App;
