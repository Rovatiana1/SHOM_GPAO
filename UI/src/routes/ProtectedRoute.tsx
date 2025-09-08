import React, { useEffect, useState, ReactNode } from "react";
import env from "../config/env";

// Typage des props
interface ProtectedRouteProps {
  children: ReactNode;
}

// Typage pour la session déchiffrée
interface SessionData {
  apiKey: string;
  expiresAt: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      const ciphertext = sessionStorage.getItem("api_key_encrypted");
      const iv = sessionStorage.getItem("api_key_iv");

      if (ciphertext && iv) {
        // const session = decryptSession<SessionData>(ciphertext, iv);

        // if (session) {
        //   const { apiKey, expiresAt } = session;
        //   if (Date.now() < expiresAt && apiKey === env.API_KEY) {
        //     setIsValid(true);
        //   } else {
        //     sessionStorage.removeItem("api_key_encrypted");
        //     sessionStorage.removeItem("api_key_iv");
        //   }
        // }
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) return null;

  // return isValid ? children : <ApiKeyAuth onValidate={() => setIsValid(true)} />;
  return children;
};

export default ProtectedRoute;
