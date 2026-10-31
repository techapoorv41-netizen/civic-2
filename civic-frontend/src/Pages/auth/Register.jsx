import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { ROLES, ROUTES } from "../../utils/constants";
import { ShieldAlert, User, Mail, Lock, Phone, UserCheck, Shield } from "lucide-react";

const checkName = (v) => {
  const s = v.trim();
  if (!s) return "Full name is required";
  if (s.length < 2) return "Name must be at least 2 characters";
  if (s.length > 60) return "Name can be at most 60 characters";
  return "";
};

const checkEmail = (v) => {
  const s = v.trim();
  if (!s) return "Email is required";
  if (!/^\S+@\S+\.\S+$/.test(s)) return "Enter a valid email address";
  return "";
};

const checkPassword = (v) => {
  if (!v) return "Password is required";
  if (v.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(v)) return "Password must contain a letter";
  if (!/\d/.test(v)) return "Password must contain a number";
  return "";
};

const checkPhone = (v) => {
  const s = v.trim();
  if (!s) return "Phone number is required";
  if (!/^[0-9+\-\s]{8,15}$/.test(s)) return "Phone must be 8 to 15 characters (digits, +, -, space)";
  return "";
};

const getErrMsg = (err) => {
  const e = err?.response?.data?.error;
  if (e?.details?.length) return `${e.message}: ${e.details[0].path} - ${e.details[0].message}`;
  return e?.message || err?.message || "Registration failed. Please try again.";
};

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

    const nameErr = checkName(formData.name);
    const emailErr = checkEmail(formData.email);
    const passErr = checkPassword(formData.password);
    const phoneErr = checkPhone(formData.phone);

    if (nameErr || emailErr || passErr || phoneErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        password: passErr,
        phone: phoneErr,
      });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim(),
      role: formData.role,
    };

    setIsSubmitting(true);
    try {
      const res = await register(payload);
      if (res?.success) {
        if (res.data?.user?.role === ROLES.OFFICIAL) {
          navigate(ROUTES.OFFICIAL_DASHBOARD, { replace: true });
        } else {
          navigate(ROUTES.CITIZEN_HOME, { replace: true });
        }
      } else {
        setServerError(res?.meta?.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setServerError(getErrMsg(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-teal-500/25">
            <ShieldAlert size={32} className="stroke-[2.2]" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Create your CivicSense Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Join your community in reporting, tracking, and resolving civic issues
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 rounded-3xl sm:px-10">

          {/* Role Picker */}
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Account Type *
          </label>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: ROLES.CITIZEN }))}
              className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all cursor-pointer ${
                formData.role === ROLES.CITIZEN
                  ? "border-teal-600 bg-teal-50/50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <UserCheck size={16} />
                Citizen
              </div>
              <span className="text-[11px] text-slate-500 leading-tight">
                Report & track local issues
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: ROLES.OFFICIAL }))}
              className={`p-3 rounded-2xl border-2 text-left flex flex-col gap-1 transition-all cursor-pointer ${
                formData.role === ROLES.OFFICIAL
                  ? "border-teal-600 bg-teal-50/50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <Shield size={16} />
                Official
              </div>
              <span className="text-[11px] text-slate-500 leading-tight">
                Manage & resolve tasks
              </span>
            </button>
          </div>

          {serverError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
              <span className="shrink-0">??</span>
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
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              leftIcon={<Phone size={18} />}
              required
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              required
              helperText="At least 8 characters, with a letter and a number"
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
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to={ROUTES.LOGIN}
                className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
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