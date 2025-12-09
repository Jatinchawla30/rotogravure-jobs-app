import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const { firebaseUser, user, loading } = useAuth();
  const [job, setJob] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!id) return;
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    const loadJob = async () => {
      const jobRef = doc(db, "jobs", id);
      const snap = await getDoc(jobRef);
      if (!snap.exists()) {
        alert("Job not found");
        router.replace("/jobs");
        return;
      }
      const data = snap.data();
      setJob({ id: snap.id, ...data });
      setForm({
        jobNumber: data.jobNumber || "",
        customerName: data.customerName || "",
        brandName: data.brandName || "",
        designName: data.designName || "",
        cylinderNumbers: data.cylinderNumbers || "",
        webWidthMm: data.webWidthMm || "",
        repeatLengthMm: data.repeatLengthMm || "",
        gussetMm: data.gussetMm || "",
        numberOfColours: data.numberOfColours || "",
        colourNames: data.colourNames || "",
        notes: data.notes || "",
        materialsText: (data.materials || [])
          .map((m) => `${m.type || ""}, ${m.thicknessMicron || ""}`)
          .join("\n"),
      });
    };

    loadJob();
  }, [id, loading, firebaseUser, router]);

  const canEdit = user && user.role !== "viewer";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const parseMaterials = (text) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    return lines.map((line) => {
      const parts = line.split(",");
      const type = parts[0]?.trim() || "";
      const thicknessMicron = parts[1] ? Number(parts[1].trim()) : null;
      return { type, thicknessMicron };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError("");

    try {
      const materials = parseMaterials(form.materialsText);
      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, {
        jobNumber: form.jobNumber,
        customerName: form.customerName,
        brandName: form.brandName,
        designName: form.designName,
        cylinderNumbers: form.cylinderNumbers,
        webWidthMm: form.webWidthMm
          ? Number(form.webWidthMm)
          : null,
        repeatLengthMm: form.repeatLengthMm
          ? Number(form.repeatLengthMm)
          : null,
        gussetMm: form.gussetMm ? Number(form.gussetMm) : null,
        numberOfColours: form.numberOfColours
          ? Number(form.numberOfColours)
          : null,
        colourNames: form.colourNames,
        notes: form.notes,
        materials,
      });
      setEditing(false);
      const snap = await getDoc(jobRef);
      const data = snap.data();
      setJob({ id: snap.id, ...data });
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save changes");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const fileRef = ref(
        storage,
        `jobs/${id}/${Date.now()}-${file.name}`
      );
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, {
        imageUrls: (job.imageUrls || []).concat(url),
      });

      setJob((prev) => ({
        ...prev,
        imageUrls: (prev.imageUrls || []).concat(url),
      }));
    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading || !job || !form) return <p>Loading...</p>;
  if (!firebaseUser) return null;

  return (
    <Layout>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Job Details</h1>
        {canEdit && (
          <button
            onClick={() => setEditing((v) => !v)}
            style={{
              padding: "6px 10px",
              backgroundColor: "#111827",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {editing ? "Cancel Edit" : "Edit Job"}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave}>
          {saveError && <p style={{ color: "red" }}>{saveError}</p>}
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label>Job Number</label>
              <input
                type="text"
                name="jobNumber"
                value={form.jobNumber}
                onChange={handleChange}
              />
            </div>
            <div style={fieldStyle}>
              <label>Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label>Brand Name</label>
              <input
                type="text"
                name="brandName"
                value={form.brandName}
                onChange={handleChange}
              />
            </div>
            <div style={fieldStyle}>
              <label>Design Name</label>
              <input
                type="text"
                name="designName"
                value={form.designName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label>Cylinder Numbers</label>
              <input
                type="text"
                name="cylinderNumbers"
                value={form.cylinderNumbers}
                onChange={handleChange}
              />
            </div>
            <div style={fieldStyle}>
              <label>Number of Colours</label>
              <input
                type="number"
                name="numberOfColours"
                value={form.numberOfColours}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label>Colour Names / Shade Description</label>
              <input
                type="text"
                name="colourNames"
                value={form.colourNames}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={rowStyle}>
            <div style={fieldStyle}>
              <label>Web Width (mm)</label>
              <input
                type="number"
                name="webWidthMm"
                value={form.webWidthMm}
                onChange={handleChange}
              />
            </div>
            <div style={fieldStyle}>
              <label>Repeat Length (mm)</label>
              <input
                type="number"
                name="repeatLengthMm"
                value={form.repeatLengthMm}
                onChange={handleChange}
              />
            </div>
            <div style={fieldStyle}>
              <label>Gusset (mm)</label>
              <input
                type="number"
                name="gussetMm"
                value={form.gussetMm}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>
              Materials (one per line, format: MaterialType, ThicknessMicron)
            </label>
            <textarea
              name="materialsText"
              value={form.materialsText}
              onChange={handleChange}
              rows={4}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label>Notes / Remarks</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "8px 12px",
              backgroundColor: "#111827",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </form>
      ) : (
        <div>
          <p>
            <strong>Job Number:</strong> {job.jobNumber}
          </p>
          <p>
            <strong>Customer:</strong> {job.customerName}
          </p>
          <p>
            <strong>Brand:</strong> {job.brandName}
          </p>
          <p>
            <strong>Design:</strong> {job.designName}
          </p>
          <p>
            <strong>Cylinder Numbers:</strong> {job.cylinderNumbers}
          </p>
          <p>
            <strong>Number of Colours:</strong> {job.numberOfColours}
          </p>
          <p>
            <strong>Colour Names:</strong> {job.colourNames}
          </p>
          <p>
            <strong>Web Width (mm):</strong> {job.webWidthMm}
          </p>
          <p>
            <strong>Repeat Length (mm):</strong> {job.repeatLengthMm}
          </p>
          <p>
            <strong>Gusset (mm):</strong> {job.gussetMm}
          </p>
          <p>
            <strong>Materials:</strong>
          </p>
          <ul>
            {(job.materials || []).map((m, idx) => (
              <li key={idx}>
                {m.type} {m.thicknessMicron ? `(${m.thicknessMicron}µ)` : ""}
              </li>
            ))}
          </ul>
          <p>
            <strong>Notes:</strong> {job.notes}
          </p>
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h2>Images</h2>
      {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}
      {canEdit && (
        <div style={{ marginBottom: "12px" }}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {uploading && <p>Uploading...</p>}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {(job.imageUrls || []).map((url, idx) => (
          <div key={idx} style={{ width: "150px", height: "150px" }}>
            <a href={url} target="_blank" rel="noreferrer">
              <img
                src={url}
                alt={`Job image ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            </a>
          </div>
        ))}
        {(!job.imageUrls || job.imageUrls.length === 0) && (
          <p>No images yet.</p>
        )}
      </div>
    </Layout>
  );
}

const rowStyle = {
  display: "flex",
  gap: "16px",
  marginBottom: "12px",
  flexWrap: "wrap",
};

const fieldStyle = {
  flex: "1",
  minWidth: "200px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};
