
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import MyPurchases from "./pages/MyPurchases";
import AddProduct from "./pages/AddProduct";
import MyProducts from "./pages/MyProducts";
import SavedProducts from "./pages/SavedProducts";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, isLoading, isMaster, isApproved, isPending } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // Redirect logic based on user status
  const getRedirectPath = () => {
    if (!isAuthenticated) return null;
    
    if (isMaster) return "/admin";
    if (isPending) return "/pending-approval";
    if (isApproved) return "/products";
    
    return "/pending-approval";
  };

  const redirectPath = getRedirectPath();

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated ? <Navigate to={redirectPath || "/products"} replace /> : <Landing />
      } />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending-approval" element={
        isAuthenticated && isPending ? <PendingApproval /> : <Navigate to="/" replace />
      } />
      <Route path="/admin" element={
        isAuthenticated && isMaster ? <AdminDashboard /> : <Navigate to="/" replace />
      } />
      <Route path="/products" element={
        isAuthenticated && (isApproved || isMaster) ? <Products /> : <Navigate to="/" replace />
      } />
      <Route path="/product/:id" element={
        isAuthenticated && (isApproved || isMaster) ? <ProductDetails /> : <Navigate to="/" replace />
      } />
      <Route path="/checkout" element={
        isAuthenticated && (isApproved || isMaster) ? <Checkout /> : <Navigate to="/" replace />
      } />
      <Route path="/my-purchases" element={
        isAuthenticated && (isApproved || isMaster) ? <MyPurchases /> : <Navigate to="/" replace />
      } />
      <Route path="/add-product" element={
        isAuthenticated && (isApproved || isMaster) ? <AddProduct /> : <Navigate to="/" replace />
      } />
      <Route path="/my-products" element={
        isAuthenticated && (isApproved || isMaster) ? <MyProducts /> : <Navigate to="/" replace />
      } />
      <Route path="/saved-products" element={
        isAuthenticated && (isApproved || isMaster) ? <SavedProducts /> : <Navigate to="/" replace />
      } />
      <Route path="/profile" element={
        isAuthenticated && (isApproved || isMaster) ? <Profile /> : <Navigate to="/" replace />
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
