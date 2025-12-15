import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { uploadImage } from "../../utils/uploadImage";
import { useAuth } from "../../context/AuthContext";

export default function JobDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!id) return;
    loadJob();
  }, [id]);

  const loadJob = async () => {
    const snap = await getDoc(doc(db, "jobs", id));
    if (snap.exists()) {
      setJob({ id, ...snap.data() });
    }
    setLoading(false);
  };

  // Handle image upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const path = `jobs/${id}/images/${Date.now()}-${file.name}`;

    const url = await uploadImage(file, path, (p) => setProgress(p));

    await updateDoc(doc(db, "jobs", id), {
      images: arrayUnion(url),
    });

    setUploading(false);
    loadJob();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Job Details</h1>

      <p><strong>Job Number:</strong> {job.jobNumber}</p>
      <p><strong>Customer:</strong> {job.customer}</p>
      <p><strong>Design:</strong> {job.design}</p>
      <p><strong>Colours:</strong> {job.colours}</p>

      <hr />

      {/* Only admin/operator can upload */}
      {user?.role !== "viewer" && (
        <>
          <h3>Upload Image</h3>
          <input type="file" accept="image/*" onChange={handleUpload} />

          {uploading && (
            <p>Uploading... {progress}%</p>
          )}

          <hr />
        </>
      )}

      <h2>Images</h2>

      {(!job.images || job.images.length === 0) && <p>No images uploaded yet.</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {job.images?.map((url, index) => (
          <div key={index}>
            <img
              src={url}
              alt="job image"
              style={{ width: 200, height: "auto", borderRadius: 8 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
