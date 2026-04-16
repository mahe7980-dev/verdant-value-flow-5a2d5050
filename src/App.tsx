import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TabBar from "./components/TabBar";
import Dashboard from "./pages/Dashboard";
import AssetDetail from "./pages/AssetDetail";
import AddAsset from "./pages/AddAsset";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence initial={false} mode="sync">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/asset/:id" element={<AssetDetail />} />
        <Route path="/add" element={<AddAsset />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LayoutGroup id="asset-route-transition">
          <AnimatedRoutes />
          <TabBar />
        </LayoutGroup>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
