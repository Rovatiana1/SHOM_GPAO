import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useDispatch } from "react-redux";

import Routes from "./routes/Routes";
import env from "./config/env";
import { AppDispatch } from "./store/store";
import { checkInitialAuth } from "./store/slices/authSlice";

const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(checkInitialAuth());
  }, [dispatch]);

  console.log("WELCOME GUYS 🙂");

  return (
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
