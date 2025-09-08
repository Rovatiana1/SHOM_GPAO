import { useRoutes, RouteObject } from "react-router-dom";

// routes
import MainRoutes from "./MainRoutes";
import AuthRoutes from "./AuthRoutes";

// ==============================|| ROUTING RENDER ||============================== //

const Routes: React.FC = () => {
  // Typage explicite pour TypeScript
  const routes: RouteObject[] = [MainRoutes, AuthRoutes];

  return useRoutes(routes);
};

export default Routes;
