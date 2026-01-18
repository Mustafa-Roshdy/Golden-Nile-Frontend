// components/Guard.tsx
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const Guard = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const token = Cookies.get("goldenNileToken");
    const payload = token ? decodeToken(token) : null;

    const isLoggedIn = !!token && !!payload;
    const role = payload?.role;

    // Pages that require login
    const authRequiredPages = ["/trip", "/booking", "/booking/:id", "/profile"];

    // Owner-only pages
    const ownerOnlyPages = ["/owner-dashboard", "/add-business"];

    // Check if current path matches any auth-required page
    const needsAuth = authRequiredPages.some(page =>
      page.endsWith("/:id")
        ? pathname.startsWith(page.replace("/:id", "/"))
        : pathname.startsWith(page) || pathname === page
    );

    const isOwnerPage = ownerOnlyPages.includes(pathname);

    // Guest (not logged in)
    if (!isLoggedIn) {
      if (isOwnerPage) {
        navigate("/", { replace: true });
      } else if (needsAuth) {
        navigate("/auth", { state: { from: pathname } });
      }
      return;
    }

    // Logged in users
    if (role === "customer") {
      if (isOwnerPage) {
        navigate("/", { replace: true });
      }
    }
    else if (role === "admin") {
      if (!isOwnerPage && pathname !== "/") {
        navigate("/owner-dashboard", { replace: true });
      }
    }
    else {
      // Invalid role → logout
      Cookies.remove("goldenNileToken");
      navigate("/auth");
    }
  }, [navigate, pathname]);

  return <Outlet />;
};

export default Guard;