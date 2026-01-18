// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store, RootState } from "./Redux/store";
import { AuthProvider } from "./context/AuthContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import NotFound from "./pages/NotFound";
import TripPlanner from "./pages/TripPlanner";
import OwnerDashboard from "./pages/OwnerDashboard";
import AddBusiness from "./pages/AddBusiness";
import Booking from "./pages/Bookingg";
import BookingDetail from "./pages/BookingDetail";
import Payment from "./pages/Payment";
import Offers from "./pages/Offers";
import Packages from "./pages/Packages";
import PackageDetails from "./pages/PackageDetails";
import CouplePackages from "./pages/Packages/CouplePackages";
import HoneymoonPackages from "./pages/Packages/HoneymoonPackages";
import FriendsPackages from "./pages/Packages/FriendsPackages";
import FamilyPackages from "./pages/Packages/FamilyPackages";

import Guard from "./components/Guard";
import AuthModal from "./components/AuthModal";
import ConversationsList from "./components/ConversationsList";
import ChatWindow from "./components/ChatWindow";
import FloatingChatButton from "./components/FloatingChatButton";
import GlobalSocketListener from "./components/GlobalSocketListener";

const queryClient = new QueryClient();

const AppContent = () => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const shouldHideChat = currentUser?.role === 'owner';
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes - Always Accessible */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/community" element={<Community />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/package/:id" element={<PackageDetails />} />
            <Route path="/packages/friends" element={<FriendsPackages />} />
            <Route path="/packages/family" element={<FamilyPackages />} />
            <Route path="/packages/couples" element={<CouplePackages />} />
            <Route path="/packages/honeymoon" element={<HoneymoonPackages />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/:id" element={<BookingDetail />} />

            {/* Protected Routes - Guard handles logic */}
            <Route element={<Guard />}>
              <Route path="/payment/:bookingId" element={<Payment />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/trip" element={<TripPlanner />} />

              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              <Route path="/add-business" element={<AddBusiness />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <GlobalSocketListener />
          <AuthModal />
          {!shouldHideChat && (
            <>
              <ConversationsList />
              <ChatWindow />
              <FloatingChatButton />
            </>
          )}
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </Provider>
);

export default App;