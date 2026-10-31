
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyAssignments } from "../../Api/issueApi";
import { createOfficialProfile } from "../../Api/userApi";
import Sidebar from "../../components/common/Sidebar";
import IssueCard from "../../components/issue/IssueCard";
import Loader from "../../components/common/Loader";
import { ROUTES } from "../../utils/constants";
import { CheckSquare, Clock, UserCheck } from "lucide-react";

const OfficialDashboard = () => {
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    department: "",
    designation: "",
    employeeId: "",
    area: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMyAssignments();
        if (res.success && Array.isArray(res.data)) {
          setAssignedIssues(res.data);
        }
      } catch (err) {
        console.error("Failed to load assignments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const payload = {
      department: form.department.trim(),
      designation: form.designation.trim(),
      employeeId: form.employeeId.trim(),
    };
    if (form.area.trim()) payload.area = form.area.trim();

    if (!payload.department || !payload.designation || !payload.employeeId) {
      setFormError("Department, designation and employee ID are required.");
      return;
    }

    setSaving(true);
    try {
      await createOfficialProfile(payload);
      setFormSuccess("Profile submitted. Please wait for admin verification.");
      setShowForm(false);
    } catch (err) {
      const apiError = err.response?.data?.error;
      let msg = apiError?.message || "Could not save profile. Please try again.";
      if (Array.isArray(apiError?.details) && apiError.details.length > 0) {
        msg += " (" + apiError.details.map((d) => `${d.path}: ${d.message}`).join(", ") + ")";
      }
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const totalAssigned = assignedIssues.length;
  const pendingActions = assignedIssues.filter(
    (a) => a.status === "assigned" || a.status === "accepted"
  ).length;

  if (loading) {
    return <Loader fullScreen message="Loading Official Portal..." />;
  }

  const inputClass =
    "w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Official Task Dashboard
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Manage assigned municipal tickets, accept/reject reports, and submit status updates.
            </p>
          </div>

          <Link to={ROUTES.OFFICIAL_HANDLE_REPORTS}>
            <button className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-2xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2">
              <CheckSquare size={16} />
              Handle Pending Reports
            </button>
          </Link>
        </div>

        {/* Official Profile */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Official Profile</h2>
              <p className="text-[11px] text-slate-500 mt-1">
                New officials must submit their profile. The admin verifies it before issues can be assigned.
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setFormSuccess("");
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-2xl flex items-center gap-2 shrink-0"
              >
                <UserCheck size={14} />
                Submit Profile
              </button>
            )}
          </div>

          {formSuccess && (
            <p className="text-xs font-semibold text-emerald-600">{formSuccess}</p>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Department *</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Roads"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Designation *</label>
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="e.g. Junior Engineer"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Employee ID *</label>
                <input
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP1001"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Area (optional)</label>
                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="e.g. Sector 4"
                  className={inputClass}
                />
              </div>

              {formError && (
                <p className="sm:col-span-2 text-xs font-semibold text-rose-600">{formError}</p>
              )}

              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-xs rounded-2xl"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError("");
                  }}
                  className="px-5 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-2xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <CheckSquare size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Total Assignments</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{totalAssigned}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Action Required</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{pendingActions}</h3>
            </div>
          </div>
        </div>

        {/* Assigned Issues List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Assigned Issues Queue</h2>
            <Link to={ROUTES.OFFICIAL_ALL_ISSUES} className="text-xs font-semibold text-teal-600 hover:underline">
              View All Department Issues &rarr;
            </Link>
          </div>

          {assignedIssues.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No assigned tasks pending in your department queue.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedIssues.map((a) => (
                <IssueCard
                  key={a.id}
                  issue={{
                    ...a.issue,
                    id: a.issueId,
                    status: a.issue?.status,
                    description: a.issue?.description || a.remarks || "",
                    createdAt: a.createdAt,
                  }}
                />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default OfficialDashboard;