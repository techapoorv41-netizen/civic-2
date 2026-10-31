import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createIssue, getCategories, uploadAttachment } from "../../Api/issueApi";
import InputField from "../common/InputField";
import Button from "../common/Button";
import IssueMap from "./IssueMap";
import { Upload, MapPin, LocateFixed } from "lucide-react";

const IssueForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    address: "",
  });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [coords, setCoords] = useState({ lat: "28.6139", lng: "77.2090" });
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || "Could not load categories.");
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleCoordChange = (e) => {
    const { name, value } = e.target;
    setCoords((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        });
        setLocating(false);
      },
      () => {
        setError("Could not get your location. Allow location access or type lat/lng.");
        setLocating(false);
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const latNum = Number(coords.lat);
  const lngNum = Number(coords.lng);
  const coordsValid =
    coords.lat !== "" &&
    coords.lng !== "" &&
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const title = formData.title.trim();
    const description = formData.description.trim();
    const address = formData.address.trim();

    if (!title || !description || !formData.categoryId || !address) {
      setError("Please complete all required fields (*).");
      return;
    }
    if (title.length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (description.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    if (address.length < 3) {
      setError("Address must be at least 3 characters.");
      return;
    }
    if (!coordsValid) {
      setError("Latitude must be -90 to 90 and longitude -180 to 180.");
      return;
    }

    setLoading(true);
    let newId = null;
    try {
      const res = await createIssue({
        title,
        description,
        categoryId: formData.categoryId,
        location: {
          address,
          lat: latNum,
          lng: lngNum,
        },
      });

      if (!res.success) {
        setError(res.error?.message || "Failed to submit issue report.");
        return;
      }

      newId = res.data.id;
      if (image) {
        try {
          await uploadAttachment(newId, image);
        } catch (upErr) {
          alert(
            "Issue created, but photo upload failed: " +
              (upErr.response?.data?.error?.message || "unknown error")
          );
        }
      }
      navigate(`/citizen/issue/${newId}`);
    } catch (err) {
      const d = err.response?.data?.error;
      const detail = d?.details?.[0] ? ` (${d.details[0].path}: ${d.details[0].message})` : "";
      setError((d?.message || "An error occurred while submitting your report.") + detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Report a Civic Issue
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Provide details, photos, and exact location to notify local authorities.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Issue Title"
          name="title"
          placeholder="e.g. Broken Streetlight or Hazardous Pothole"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain the problem clearly, including landmark details..."
            className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            required
          />
        </div>

        <InputField
          label="Address / Landmark"
          name="address"
          placeholder="e.g. Main Rd, Sector 4, near bus stop"
          value={formData.address}
          onChange={handleChange}
          required
        />

        {/* Location */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-2">
            <MapPin size={14} className="text-teal-600" />
            Location Coordinates
          </label>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="number"
              step="any"
              name="lat"
              value={coords.lat}
              onChange={handleCoordChange}
              placeholder="Latitude"
              className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
            <input
              type="number"
              step="any"
              name="lng"
              value={coords.lng}
              onChange={handleCoordChange}
              placeholder="Longitude"
              className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 border border-teal-600/40 rounded-xl px-3 py-2 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer disabled:opacity-60"
          >
            <LocateFixed size={14} />
            {locating ? "Getting location..." : "Use my current location"}
          </button>

          {coordsValid && <IssueMap location={{ lat: latNum, lng: lngNum }} />}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Upload Image Evidence
          </label>
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors">
            {imagePreview ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="text-xs text-rose-500 font-semibold hover:underline"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-teal-600" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Click to select an image file
                </span>
                <span className="text-[11px] text-slate-400">JPG, PNG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
          Submit Issue Report
        </Button>
      </form>
    </div>
  );
};

export default IssueForm;