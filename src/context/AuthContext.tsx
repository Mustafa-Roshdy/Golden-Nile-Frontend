import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";

type AuthModalTab = "login" | "register";

type AuthContextValue = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  isAuthModalOpen: boolean;
  authModalTab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>("login");

  useEffect(() => {
    const handleAuthChange = () => {
      const token = Cookies.get("goldenNileToken");
      setIsAuthenticated(Boolean(token));
    };

    handleAuthChange(); // Initial check

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const openAuthModal = useCallback((tab?: AuthModalTab) => {
    if (tab) setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      setAuthenticated: setIsAuthenticated,
      isAuthModalOpen,
      authModalTab,
      openAuthModal,
      closeAuthModal,
    }),
    [isAuthenticated, isAuthModalOpen, authModalTab, openAuthModal, closeAuthModal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


