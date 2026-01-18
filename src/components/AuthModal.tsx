import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import api from "@/interceptor/api";
import { loginUser, getCurrentUser } from "@/Redux/Slices/userSlice";
import { AppDispatch } from "@/Redux/store";
import { Mail, Lock } from "lucide-react";

const overlayBase = "fixed inset-0 z-[60] flex items-center justify-center bg-[hsla(220,20%,10%,0.45)] backdrop-blur-sm";
const panelBase = "relative w-[90%] max-w-md rounded-2xl bg-white/90 dark:bg-neutral-900/80 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:backdrop-blur-xl";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setActiveTab(authModalTab);
  }, [authModalTab]);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isAuthModalOpen, closeAuthModal]);

  const overlayClasses = useMemo(() => `${overlayBase} ${isAuthModalOpen ? "animate-fade-in" : "animate-fade-out"}`, [isAuthModalOpen]);
  const panelClasses = useMemo(
    () => `${panelBase} ${isAuthModalOpen ? "animate-scale-in" : "animate-scale-out"}`,
    [isAuthModalOpen]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === "login") {
        const resultAction = await dispatch(loginUser({
          email: formData.email,
          password: formData.password,
        }));

        if (loginUser.fulfilled.match(resultAction)) {
          // Login successful, now fetch full user profile
          const userResult = await dispatch(getCurrentUser());
          if (getCurrentUser.fulfilled.match(userResult)) {
            // Set user photo cookie
            const user = userResult.payload;
            const photoUrl = user.photo.startsWith('http') ? user.photo : `${api.defaults.baseURL}${user.photo}`;
            Cookies.set("goldenNileUserPhoto", photoUrl, { expires: 7 });
          }
          setAuthenticated(true);
          toast({ title: "Welcome back!", description: `${resultAction.payload.firstName} ${resultAction.payload.lastName}` });
          closeAuthModal();
          // Dispatch authChange event for components that listen to it
          window.dispatchEvent(new Event("authChange"));
          if (resultAction.payload.role === "customer") navigate("/trip");
          else navigate("/owner-dashboard");
        } else {
          toast({ title: "Login Failed", description: resultAction.payload || "Invalid credentials", variant: "destructive" });
        }
      } else {
        const res = await api.post("/api/auth/register", {
          userId: Number(formData.userid),
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          age: Number(formData.age),
          role: "customer",
        });

        if (res.data.success) {
          // After registration, login automatically
          const loginResult = await dispatch(loginUser({
            email: formData.email,
            password: formData.password,
          }));

          if (loginUser.fulfilled.match(loginResult)) {
            const userResult = await dispatch(getCurrentUser());
            if (getCurrentUser.fulfilled.match(userResult)) {
              const user = userResult.payload;
              const photoUrl = user.photo.startsWith('http') ? user.photo : `${api.defaults.baseURL}${user.photo}`;
              Cookies.set("goldenNileUserPhoto", photoUrl, { expires: 7 });
            }
            setAuthenticated(true);
            window.dispatchEvent(new Event("authChange"));
          }

          toast({ title: "Account Created", description: "Welcome to Golden Nile!" });
          if (res.data.role === "customer") navigate("/trip");
          else navigate("/owner-dashboard");
          closeAuthModal();
        } else {
          toast({ title: "Registration Failed", description: res.data.message || "Something went wrong", variant: "destructive" });
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Something went wrong", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (isAuthModalOpen) firstFieldRef.current?.focus();
  }, [isAuthModalOpen, activeTab]);

  const onKeyDownTrap = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        (last as HTMLElement).focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      (first as HTMLElement).focus();
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div
      className={overlayClasses}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        ref={panelRef}
        className={panelClasses}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onKeyDown={onKeyDownTrap}
      >
        <button
          aria-label="Close"
          onClick={closeAuthModal}
          className="absolute right-3 top-3 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          ❌
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h3 id="auth-modal-title" className="text-2xl font-bold bg-gradient-to-r from-[hsl(200,95%,45%)] to-[hsl(190,85%,55%)] bg-clip-text text-transparent">
              Golden Nile
            </h3>
            <p className="text-sm text-slate-600/80 dark:text-slate-300/80 mt-1">
              {activeTab === "login" ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-xl bg-slate-100/60 dark:bg-white/5 p-1 mb-6">
            <button
              onClick={() => setActiveTab("login")}
              className={`py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "login"
                  ? "bg-white shadow-sm text-[hsl(210,70%,35%)]"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "register"
                  ? "bg-white shadow-sm text-[hsl(210,70%,35%)]"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "register" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">First Name</label>
                  <input name="firstName" onChange={handleChange} className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(200,95%,45%)]" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Last Name</label>
                  <input name="lastName" onChange={handleChange} className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(200,95%,45%)]" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Age</label>
                  <input name="age" type="number" onChange={handleChange} className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(200,95%,45%)]" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Gender</label>
                  <select name="gender" onChange={handleChange} className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(200,95%,45%)]" required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-500">User ID</label>
                  <input name="userid" onChange={handleChange} className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(200,95%,45%)]" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-500">Phone</label>
                  <input name="phone" onChange={handleChange} className="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(200,95%,45%)]" required />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-500">Email</label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  ref={firstFieldRef}
                  name="email"
                  type="email"
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white/70 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[hsl(200,95%,45%)]"
                  placeholder="you@example.com"
                  aria-label="Email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">Password</label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white/70 pl-10 pr-12 text-sm outline-none focus:ring-2 focus:ring-[hsl(200,95%,45%)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[hsl(210,85%,55%)] to-[hsl(200,85%,60%)] text-white font-semibold shadow-md hover:from-[hsl(210,85%,50%)] hover:to-[hsl(200,85%,55%)] focus:ring-2 focus:ring-[hsl(210,85%,55%)] focus:outline-none transition-colors"
            >
              {activeTab === "login" ? "Login" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}