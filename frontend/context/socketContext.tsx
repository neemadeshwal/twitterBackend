// "use client";

// import { useCurrentUser } from "@/hooks/user";
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";

// const SocketContext = createContext<Socket | null>(null);

// export const useSocket = () => {
//   const socket = useContext(SocketContext);
//   if (!socket) {
//     throw new Error("Socket not available. Ensure you are inside the SocketProvider.");
//   }
//   return socket;
// };

// export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const { user } = useCurrentUser(); // Assuming the user is available in the context

//   useEffect(() => {
//     // Initialize the socket connection when the component mounts
//     const socketInstance = io("http://localhost:8000", {}); // Change URL as needed

//     socketInstance.on("connect", () => {
//       console.log("Connected to Socket.IO server", socketInstance);
//       setSocket(socketInstance); // Set socket instance once the connection is successful
//     });

   
//   }, []); // Empty dependency array ensures this effect runs only once on mount

//   useEffect(() => {
//     if (socket && user) {

//       socket.on("connect",()=>{
//         return socket.emit("connectedUser",user.id)
//       })


//       socket.on("disconnect", () => {
//         console.log("Disconnected from socket server");
//         return socket.emit("disconnectedUser",user.id);
//       });

      
    

//       return () => {
//         socket.off("connect", () => {});
//         socket.off("disconnect", () => {});
//       };
//     }
//   }, [socket, user]); 
//   useEffect(() => {
//     if (user?.id && socket) {
//       socket.emit("connectUserToServer", {userId:user?.id});
//     }
//   }, [socket, user?.id]);


//   return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
// };
