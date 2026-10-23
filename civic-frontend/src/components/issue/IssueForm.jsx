import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createIssue, getCategories, uploadAttachment } from "../../api/issueApi";
import InputField from "../common/InputField";
import Button from "../common/Button";
import IssueMap from "./IssueMap";
import { Upload, MapPin, CheckCircle2 } from "lucide-react";

const IssueForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.209 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCats = async () => {
      const res = await getCategories();
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError("Please complete all required fields (*).");
      return;
    }

    setLoading(true);
    try {
      const res = await createIssue({
        ...formData,
        location,
      });

      if (res.success) {
        const newId = res.data.id;
        if (image) {
          await uploadAttachment(newId, image);
        }
        navigate(`/citizen/issue/${newId}`);
      } else {
        setError(res.error || "Failed to submit issue report.");
      }
    } catch (err) {
      setError("An error occurred while submitting your report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-extrabold text-govNavy tracking-tight">
          Report a Civic Issue
        </h2>
        <p className="text-xs text-govText mt-1">
          Provide details, photos, and exact location to notify local authorities.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-govOrange/30 text-govOrange text-xs font-bold flex items-center gap-2">
          <span className="shrink-0 text-base">⚠️</span>
          <span>{error}</span>
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
          <label className="text-xs font-semibold text-govText">
            Category <span className="text-govOrange font-bold">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-2xl bg-white border border-slate-300 px-4 py-2.5 text-sm text-govText focus:outline-none focus:ring-2 focus:ring-govSlate/20 focus:border-govSlate"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-govText">
            Detailed Description <span className="text-govOrange font-bold">*</span>
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain the problem clearly, including landmark details..."
            className="w-full rounded-2xl bg-white border border-slate-300 p-4 text-sm text-govText focus:outline-none focus:ring-2 focus:ring-govSlate/20 focus:border-govSlate"
            required
          />
        </div>

        {/* Location Picker */}
        <div>
          <label className="text-xs font-semibold text-govText flex items-center gap-1 mb-2">
            <MapPin size={14} className="text-govSlate" />
            Location Coordinates Pin
          </label>
          <IssueMap location={location} />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="text-xs font-semibold text-govText block mb-2">
            Upload Image Evidence
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-govOrange transition-colors bg-govLight/40">
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
                  className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-govSlate" />
                <span className="text-xs font-semibold text-govNavy">
                  Click to select an image file
                </span>
                <span className="text-[11px] text-govText/70">PNG, JPG, JPEG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
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