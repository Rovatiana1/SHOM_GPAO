import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Socket, io } from "socket.io-client";
import env from "../config/env";

// Typage du context : Socket ou null
const SocketContext = createContext<Socket | null>(null);

// Typage des props du provider
interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // const newSocket: Socket = io(env.BASE_URL, {
    //   transports: ["websocket", "polling"],
    //   path: env.PREFIXE_URL + "/socket",
    //   upgrade: true,
    // });
    
    // setSocket(newSocket);

    // return () => {
    //   newSocket.disconnect();
    // };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook personnalisé pour utiliser le socket
export const useSocket = (): Socket | null => useContext(SocketContext);
