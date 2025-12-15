import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useAuth } from "../../context/AuthContext";

export default function JobDetails() {
  const router = useRouter();
  const { id } = router.query;

  const { user } = useAuth(); // determines if admin
  const isAdmin = user?.role === "admin";

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [error, setError] = useState("");

  // Fetch job details
  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const docRef = doc(db, "jobs", id);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          setError("Job not found.");
          return;
        }

        setJob({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
        setError("Failed to load job.");
      }
      setLoading(false);
    };

    fetchJob();
  }, [id]);

  // Upload file
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const fileRef = ref(storage, `jobs/${id}/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snap) => {
        const pct = Math.round(
          (snap.bytesTransferred / snap.totalBytes) * 100
        );
        setProgress(pct);
      },
      (err) => {
        console.error(err);
        setError("Upload failed.");
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);

        // Save URL to Firestore
        await updateDoc(doc(db, "jobs", id), {
          images: arrayUnion(url),
          updatedAt: new Date(),
        });

        // Refresh local state
        setJob((prev) => ({
          ...prev,
          images: [...(prev.images || []), url],
        }));

        setUploading(false);
      }
    );
  };

  // Delete image
  const deleteImage = async (url) => {
    if (!confirm("Delete this image?")) return;

    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);

      // Remove from Firestore
      await updateDoc(doc(db, "jobs", id), {
        images: arrayRemove(url),
      });

      // Refresh UI
      setJob((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== url),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete image.");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading job…</p>;
  if (error) return <p style={{ padding: 20, color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Job Card */}
      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>{job.title}</h2>
        <p style={{ opacity: 0.8 }}>{job.description || "No description."}</p>

        <p style={{ marginTop: "10px", fontSize: "14px", opacity: 0.6 }}>
          Status: <b>{job.status}</b>
        </p>
      </div>

      {/* Image Upload (Admin Only) */}
      {isAdmin && (
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            marginBottom: "30px",
          }}
        >
          <h3>Upload Images</h3>

          {uploading ? (
            <p>Uploading: {progress}%</p>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={uploadImage}
              style={{ marginTop: "10px" }}
            />
          )}
        </div>
      )}

      {/* Images List */}
      <h3 style={{ marginBottom: "10px" }}>Images</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {job.images && job.images.length > 0 ? (
          job.images.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <img
                src={url}
                style={{ width: "100%", height: "160px", objectFit: "cover" }}
              />

              {isAdmin && (
                <button
                  onClick={() => deleteImage(url)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p style={{ opacity: 0.7 }}>No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
