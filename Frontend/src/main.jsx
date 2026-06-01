import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import './index.css'
import App from "./App.jsx";
import 'stream-chat-react/dist/css/v2/index.css';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'


import { SocketProvider } from "./context/SocketContext.jsx";

const queryClient = new QueryClient()
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
