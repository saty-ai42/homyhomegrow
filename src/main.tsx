import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'

// Theme initialization - runs IMMEDIATELY before any CSS or JS loads
(function() {
  try {
    var theme = localStorage.getItem("homyhomegrow-theme");
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <TRPCProvider>
          <App />
        </TRPCProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
