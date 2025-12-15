import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";

export default function NewJob() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      setLoading(false);
      return;
    }

    try {
      // Create job document
      const docRef = await addDoc(collection(db, "jobs"), {
        title,
        description,
        images: [], // REQUIRED
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "open",
      });

      // Redirect to job details page
      router.push(`/jobs/${docRef.id}`);
    } catch (err) {
      console.error("Error creating job:", err);
      setError("Failed to create job. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "40px auto" }}>
      <h2>Create New Job</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={createJob}>
        <label>Job Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <label>Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "10px", height: "120px" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "15px",
            padding: "12px 20px",
            width: "100%",
            background: "#000",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}
