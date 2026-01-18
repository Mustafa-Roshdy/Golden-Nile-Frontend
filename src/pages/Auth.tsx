import { useState } from "react";
import { Eye, EyeOff, User, Building2, Mail, Lock, Phone, CreditCard, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import authImage from "@/assets/aswan-sunset.jpg";
import Cookies from "js-cookie";
import api from "@/interceptor/api";
import { AuthInfo } from "@/types/auth";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"guest" | "owner">("guest");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res: AuthInfo = await api.post("/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        if (res.success) {
          Cookies.set("goldenNileToken", res.token, { expires: 7 });
          Cookies.set("goldenNileUserPhoto", res.data.photo ? res.data.photo : `${api.defaults.baseURL}${res.data.photo}`, { expires: 7 });
          
          toast({
            title: "Welcome back!",
            description: `${res.data.firstName} ${res.data.lastName}`,
          });

          if (res.data.role == "customer") {
            navigate("/");
          }
          else {
            navigate("/profile");
          }
        } else {
          toast({
            title: "Login Failed",
            description: res.message || "Invalid credentials",
            variant: "destructive",
          });
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
          role: userType === "owner" ? "admin" : "customer",
        });

        toast({
          title: "Account Created",
          description: "You can now sign in with your credentials.",
        });
        if (res.data.role == "customer") {
          navigate("/");
        }
        else {
          navigate("/profile");
        }

        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={authImage}
            alt="Sunset on the Nile"
            className="w-full h-full object-cover scale-105 transition-transform duration-[10s] ease-out"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-white p-12 xl:p-20 z-10">
          <div className="max-w-2xl w-full px-4 space-y-6 xl:space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-4 xl:px-5 py-2 xl:py-2.5 bg-white/15 backdrop-blur-xl rounded-full border border-white/25 shadow-xl">
              <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse" />
              <span className="text-xs xl:text-sm font-semibold text-white tracking-wide">Golden Nile Experience</span>
            </div>
            <div className="space-y-4 xl:space-y-6">
              <h1 className="text-4xl xl:text-6xl 2xl:text-7xl font-extrabold leading-[1.1] tracking-tight">
                Explore the timeless
                <br />
                <span className="bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent">
                  beauty of Egypt
                </span>
              </h1>
              <p className="text-lg xl:text-xl 2xl:text-2xl text-white/95 leading-relaxed font-medium max-w-lg">
                Start your journey today with Golden Nile and discover ancient wonders
              </p>
              <div className="flex items-center gap-3 xl:gap-4 pt-2 xl:pt-4">
                <div className="h-1.5 w-16 xl:w-20 bg-gradient-to-r from-secondary to-secondary/60 rounded-full" />
                <div className="h-1.5 w-10 xl:w-12 bg-secondary/40 rounded-full" />
                <div className="h-1.5 w-5 xl:w-6 bg-secondary/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-2 sm:p-4 lg:p-4 xl:p-6 2xl:p-8 bg-gradient-to-br from-white via-slate-50/50 to-white relative">
        {/* Back to Home Button */}
        <Link to="/" className="absolute top-4 left-4 xl:top-8 xl:left-8 z-20 group">
          <Button variant="ghost" className="flex items-center gap-2 text-slate-600 hover:text-primary hover:bg-white/50 backdrop-blur-sm transition-all duration-300 rounded-full pl-3 pr-4 py-2 border border-slate-200/50 shadow-sm">
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-sm font-semibold tracking-wide">Back to Home</span>
          </Button>
        </Link>

        {/* Subtle decorative elements - contained within viewport */}
        <div className="absolute top-0 right-0 w-64 h-64 xl:w-96 xl:h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 xl:w-96 xl:h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="w-full max-w-xl xl:max-w-2xl py-2 xl:py-4 relative z-10 px-2 sm:px-0">
          <Card className="border-0 shadow-2xl shadow-black/5 bg-white/80 backdrop-blur-xl">
            <CardContent className="p-0">
              {/* Header Section */}
              <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 xl:pt-8 pb-4 xl:pb-6 border-b border-slate-200/60 bg-gradient-to-br from-white via-slate-50/30 to-white">
                <div className="text-center space-y-3 xl:space-y-4 mb-8 xl:mb-10">
                  <Link to="/" className="inline-block group">
                    <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent tracking-tight mb-2 transition-transform duration-300 group-hover:scale-105">
                      Golden Nile
                    </h2>
                  </Link>
                  <p className="text-base xl:text-lg text-slate-600 font-medium">
                    {isLogin ? "Welcome back! Sign in to continue" : "Create your account to get started"}
                  </p>
                </div>

                {/* Enhanced Tabs */}
                <div className="flex gap-2 xl:gap-3 mb-2">
                  <button
                    onClick={() => setIsLogin(true)}
                    type="button"
                    className={`flex-1 py-3 xl:py-4 px-4 xl:px-6 text-center font-semibold text-sm xl:text-base rounded-xl transition-all duration-300 relative ${isLogin
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                      }`}
                  >
                    Sign In
                    {isLogin && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 xl:w-12 h-1 bg-white/80 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    type="button"
                    className={`flex-1 py-3 xl:py-4 px-4 xl:px-6 text-center font-semibold text-sm xl:text-base rounded-xl transition-all duration-300 relative ${!isLogin
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                      }`}
                  >
                    Register
                    {!isLogin && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 xl:w-12 h-1 bg-white/80 rounded-full" />
                    )}
                  </button>
                </div>
              </div>

              {/* Form Container - Scrollable for Register */}
              <div className={`px-4 sm:px-6 lg:px-8 xl:px-10 ${!isLogin ? 'py-4 xl:py-6 max-h-[calc(100vh-250px)] overflow-y-auto' : 'py-4 xl:py-6'}`}>
                {/* User Type Selection - Only for Register */}
                {!isLogin && (
                  <div className="mb-8 xl:mb-10">
                    <Label className="mb-4 xl:mb-5 block text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Select Account Type
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:gap-4">
                      <button
                        onClick={() => setUserType("guest")}
                        type="button"
                        className={`relative p-4 xl:p-6 rounded-xl xl:rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden ${userType === "guest"
                          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10"
                          : "border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50/80 hover:shadow-md"
                          }`}
                      >
                        {userType === "guest" && (
                          <div className="absolute top-3 right-3 xl:top-4 xl:right-4 w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                            <div className="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-white rounded-full" />
                          </div>
                        )}
                        <div className="flex items-start gap-3 xl:gap-4">
                          <div className={`p-2.5 xl:p-3 rounded-lg xl:rounded-xl transition-all duration-300 shrink-0 ${userType === "guest"
                            ? "bg-primary/20 text-primary"
                            : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                            }`}>
                            <User className="h-4 w-4 xl:h-5 xl:w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm xl:text-base text-slate-900 mb-1 xl:mb-1.5">Guest</div>
                            <div className="text-xs xl:text-sm text-slate-500 leading-snug">Book amazing trips and experiences</div>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setUserType("owner")}
                        type="button"
                        className={`relative p-4 xl:p-6 rounded-xl xl:rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden ${userType === "owner"
                          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10"
                          : "border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50/80 hover:shadow-md"
                          }`}
                      >
                        {userType === "owner" && (
                          <div className="absolute top-3 right-3 xl:top-4 xl:right-4 w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                            <div className="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-white rounded-full" />
                          </div>
                        )}
                        <div className="flex items-start gap-3 xl:gap-4">
                          <div className={`p-2.5 xl:p-3 rounded-lg xl:rounded-xl transition-all duration-300 shrink-0 ${userType === "owner"
                            ? "bg-primary/20 text-primary"
                            : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                            }`}>
                            <Building2 className="h-4 w-4 xl:h-5 xl:w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm xl:text-base text-slate-900 mb-1 xl:mb-1.5">Owner</div>
                            <div className="text-xs xl:text-sm text-slate-500 leading-snug">List and manage your properties</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form className="space-y-5 xl:space-y-6" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <>
                      {/* Personal Information Section */}
                      <div className="space-y-5 xl:space-y-6 pb-5 xl:pb-6 border-b border-slate-200/60">
                        <div className="flex items-center gap-2 xl:gap-3 mb-4 xl:mb-6">
                          <div className="p-1.5 xl:p-2 bg-primary/10 rounded-lg">
                            <User className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
                          </div>
                          <h3 className="text-xs xl:text-sm font-bold text-slate-700 uppercase tracking-wider">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-5">
                          <div className="space-y-2.5">
                            <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              onChange={handleChange}
                              className="h-11 xl:h-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                              placeholder="John"
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              onChange={handleChange}
                              className="h-11 xl:h-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                              placeholder="Doe"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-5">
                          <div className="space-y-2.5">
                            <Label htmlFor="age" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              Age
                            </Label>
                            <Input
                              id="age"
                              type="number"
                              onChange={handleChange}
                              className="h-11 xl:h-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                              placeholder="25"
                              min="18"
                            />
                          </div>
                          <div className="space-y-2.5">
                            <Label htmlFor="gender" className="text-sm font-semibold text-slate-700">
                              Gender
                            </Label>
                            <select
                              id="gender"
                              onChange={handleChange}
                              className="w-full h-11 xl:h-12 px-3 xl:px-4 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-slate-900 font-medium cursor-pointer"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="userid" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                            National ID
                          </Label>
                          <Input
                            id="userid"
                            onChange={handleChange}
                            className="h-11 xl:h-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                            placeholder="Enter your national ID"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Contact Information Section */}
                  <div className="space-y-5 xl:space-y-6 pb-5 xl:pb-6 border-b border-slate-200/60">
                    {!isLogin && (
                      <div className="flex items-center gap-2 xl:gap-3 mb-4 xl:mb-6">
                        <div className="p-1.5 xl:p-2 bg-primary/10 rounded-lg">
                          <Mail className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
                        </div>
                        <h3 className="text-xs xl:text-sm font-bold text-slate-700 uppercase tracking-wider">Contact Information</h3>
                      </div>
                    )}
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        onChange={handleChange}
                        className="h-11 xl:h-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                        placeholder="your.email@example.com"
                      />
                    </div>

                  </div>

                  {/* Security Section */}
                  <div className="space-y-5 xl:space-y-6">
                    {!isLogin && (
                      <div className="flex items-center gap-2 xl:gap-3 mb-4 xl:mb-6">
                        <div className="p-1.5 xl:p-2 bg-primary/10 rounded-lg">
                          <Lock className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-primary" />
                        </div>
                        <h3 className="text-xs xl:text-sm font-bold text-slate-700 uppercase tracking-wider">Security</h3>
                      </div>
                    )}
                    <div className="space-y-2.5">
                      <Label htmlFor="password" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          onChange={handleChange}
                          className="h-11 xl:h-12 pr-11 xl:pr-12 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-400"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 xl:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1.5 xl:p-2 rounded-lg hover:bg-slate-100"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 xl:h-5 xl:w-5" />
                          ) : (
                            <Eye className="h-4 w-4 xl:h-5 xl:w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 xl:h-14 text-sm xl:text-base font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 mt-6 xl:mt-8 bg-primary hover:bg-primary/90 text-white rounded-xl"
                    size="lg"
                  >
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;