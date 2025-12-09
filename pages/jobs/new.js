import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function NewJobPage() {
  const { firebaseUser, user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    jobNumber: "",
    customerName: "",
    brandName: "",
    designName: "",
    cylinderNumbers: "",
    materialsText: "",
    webWidthMm: "",
    repeatLengthMm: "",
    gussetMm: "",
    numberOfColours: "",
    colourNames: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }
    if (user && user.role === "viewer") {
      alert("You do not have permission to create jobs.");
      router.replace("/jobs");
    }
  }, [firebaseUser, loading, router, user]);

  if (loading) return <p>Loading...</p>;
  if (!firebaseUser || (user && user.role === "viewer")) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const materials = parseMaterials(form.materialsText);

      const jobDoc = {
        jobNumber: form.jobNumber,
        customerName: form.customerName,
        brandName: form.brandName,
        designName: form.designName,
        cylinderNumbers: form.cylinderNumbers,
        materials,
        webWidthMm: form.webWidthMm ? Number(form.webWidthMm) : null,
        repeatLengthMm: form.repeatLengthMm
          ? Number(form.repeatLengthMm)
          : null,
        gussetMm: form.gussetMm ? Number(form.gussetMm) : null,
        numberOfColours: form.numberOfColours
          ? Number(form.numberOfColours)
          : null,
        colourNames: form.colourNames,
        notes: form.notes,
        imageUrls: [],
        createdAt: serverTimestamp(),
        createdByUid: firebaseUser.uid,
      };

      const ref = await addDoc(collection(db, "jobs"), jobDoc);
      router.push(`/jobs/${ref.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <h1 style={{ marginBottom: "16px" }}>New Job</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={rowStyle}>
          <div style={fieldStyle}>
            <label>Job Number</label>
            <input
              type="text"
              name="jobNumber"
              value={form.jobNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div style={fieldStyle}>
            <label>Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              required
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
              required
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
            placeholder={`Example:
PET, 12
METPET, 12`}
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
          disabled={submitting}
          style={{
            padding: "8px 12px",
            backgroundColor: "#111827",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {submitting ? "Creating..." : "Create Job"}
        </button>
      </form>
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
