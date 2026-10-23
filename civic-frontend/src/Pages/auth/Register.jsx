import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { validateEmail, validatePassword, validatePhone } from "../../utils/helpers";
import { ROLES, ROUTES } from "../../utils/constants";
import { ShieldAlert, User, Mail, Lock, Phone, UserCheck, Shield } from "lucide-react";

const Register = () => {
  const { register, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: ROLES.CITIZEN,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const nameErr = !formData.name.trim() ? "Full name is required" : "";
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);
    const phoneErr = validatePhone(formData.phone);

    if (nameErr || emailErr || passErr || phoneErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        password: passErr,
        phone: phoneErr,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(formData);
      if (res.success) {
        if (res.data?.user?.role === ROLES.OFFICIAL) {
          navigate(ROUTES.OFFICIAL_DASHBOARD, { replace: true });
        } else {
          navigate(ROUTES.CITIZEN_HOME, { replace: true });
        }
      } else {
        setServerError(res.error?.message || res.meta?.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "An unexpected error occurred during registration."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-govLight flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-govNavy flex items-center justify-center text-govOrange shadow-xl shadow-govNavy/20">
            <ShieldAlert size={32} className="stroke-[2.2]" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-govNavy tracking-tight">
          Create your CivicSense Account
        </h2>
        <p className="mt-2 text-center text-sm text-govText">
          Join your community in reporting, tracking, and resolving civic issues
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-govNavy/5 border border-slate-200 rounded-3xl sm:px-10">

          {/* Role Picker */}
          <label className="block text-xs font-bold uppercase tracking-wider text-govNavy mb-2">
            Account Type *
          </label>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: ROLES.CITIZEN }))}
              className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all cursor-pointer ${
                formData.role === ROLES.CITIZEN
                  ? "border-govNavy bg-govLight text-govNavy shadow-sm"
                  : "border-slate-200 text-govText hover:border-govSlate/40"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <UserCheck size={16} className={formData.role === ROLES.CITIZEN ? "text-govOrange" : "text-govSlate"} />
                Citizen
              </div>
              <span className="text-[11px] text-govText/70 leading-tight">
                Report & track local issues
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: ROLES.OFFICIAL }))}
              className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all cursor-pointer ${
                formData.role === ROLES.OFFICIAL
                  ? "border-govNavy bg-govLight text-govNavy shadow-sm"
                  : "border-slate-200 text-govText hover:border-govSlate/40"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <Shield size={16} className={formData.role === ROLES.OFFICIAL ? "text-govOrange" : "text-govSlate"} />
                Official
              </div>
              <span className="text-[11px] text-govText/70 leading-tight">
                Manage & resolve tasks
              </span>
            </button>
          </div>

          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-govOrange/30 text-govOrange text-xs font-bold flex items-start gap-2.5">
              <span className="shrink-0">⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <InputField
              label="Full Name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<User size={18} />}
              required
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={18} />}
              required
            />

            <InputField
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 555-0199 (Optional)"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              leftIcon={<Phone size={18} />}
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              required
              helperText="Must contain at least 6 characters"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting || authLoading}
              className="mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-govText">
              Already have an account?{" "}
              <Link
                to={ROUTES.LOGIN}
                className="font-bold text-govSlate hover:text-govOrange underline decoration-govOrange/50 transition-colors"
              >
                Log in instead
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
