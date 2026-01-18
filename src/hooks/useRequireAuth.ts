import { useAuth } from "@/context/AuthContext";

export const useRequireAuth = () => {
  const { isAuthenticated, openAuthModal } = useAuth();

  return (onAuthedAction?: () => void, preferredTab?: "login" | "register") => {
    if (isAuthenticated) {
      onAuthedAction?.();
      return;
    }
    openAuthModal(preferredTab || "login");
  };
};


