import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { validateEmail, validatePassword } from "../../utils/helpers";
import { ROLES, ROUTES } from "../../utils/constants";
import { ShieldAlert, Mail, Lock, UserCheck, Shield, KeyRound } from "lucide-react";

const Login = () => {
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ROLES.CITIZEN,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(formData);
      if (res.success) {
        const userRole = res.data?.user?.role || formData.role;
        if (userRole === ROLES.ADMIN) {
          navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
        } else if (userRole === ROLES.OFFICIAL) {
          navigate(ROUTES.OFFICIAL_DASHBOARD, { replace: true });
        } else {
          navigate(ROUTES.CITIZEN_HOME, { replace: true });
        }
      } else {
        setServerError(res.error?.message || res.meta?.error || res.error || "Login failed. Please check credentials.");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (roleType) => {
    let email = "citizen@civicsense.com";
    if (roleType === ROLES.OFFICIAL) email = "official@civicsense.com";
    if (roleType === ROLES.ADMIN) email = "admin@civicsense.com";

    setFormData({
      email,
      password: "password123",
      role: roleType,
    });
    setErrors({});
    setServerError("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-govLight flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-govNavy flex items-center justify-center text-govOrange shadow-xl shadow-govNavy/20">
            <ShieldAlert size={32} className="stroke-[2.2]" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-govNavy tracking-tight">
          Welcome back to CivicSense
        </h2>
        <p className="mt-2 text-center text-xs text-govText">
          Empowering citizens & officials for smarter civic resolution
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-govNavy/5 border border-slate-200 rounded-3xl sm:px-10">
          
          {/* Role Toggle Selector */}
          <div className="mb-6 p-1.5 bg-govLight rounded-2xl flex gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: ROLES.CITIZEN }))}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                formData.role === ROLES.CITIZEN
                  ? "bg-govNavy text-white shadow-sm font-bold"
                  : "text-govText hover:text-govNavy hover:bg-white"
              }`}
            >
              <UserCheck size={14} />
              Citizen
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: ROLES.OFFICIAL }))}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                formData.role === ROLES.OFFICIAL
                  ? "bg-govNavy text-white shadow-sm font-bold"
                  : "text-govText hover:text-govNavy hover:bg-white"
              }`}
            >
              <Shield size={14} />
              Official
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: ROLES.ADMIN }))}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                formData.role === ROLES.ADMIN
                  ? "bg-govNavy text-white shadow-sm font-bold"
                  : "text-govText hover:text-govNavy hover:bg-white"
              }`}
            >
              <KeyRound size={14} />
              Admin
            </button>
          </div>

          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-govOrange/30 text-govOrange text-xs font-bold flex items-center gap-2">
              <span className="shrink-0 text-base">⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={18} />}
              required
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting || authLoading}
            >
              Sign In to CivicSense
            </Button>
          </form>

          {/* Demo Autofill Helpers */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-bold text-govSlate uppercase tracking-wider text-center mb-3">
              Quick Demo Logins
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill(ROLES.CITIZEN)}
                className="flex-1 py-1.5 px-2 bg-govLight hover:bg-govSlate/10 border border-slate-200 rounded-xl text-[11px] font-semibold text-govSlate transition-colors cursor-pointer text-center"
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(ROLES.OFFICIAL)}
                className="flex-1 py-1.5 px-2 bg-govLight hover:bg-govSlate/10 border border-slate-200 rounded-xl text-[11px] font-semibold text-govSlate transition-colors cursor-pointer text-center"
              >
                Official
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(ROLES.ADMIN)}
                className="flex-1 py-1.5 px-2 bg-govLight hover:bg-govSlate/10 border border-slate-200 rounded-xl text-[11px] font-semibold text-govSlate transition-colors cursor-pointer text-center"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-govText">
              Don't have an account?{" "}
              <Link
                to={ROUTES.REGISTER}
                className="font-bold text-govSlate hover:text-govOrange underline decoration-govOrange/50 transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
