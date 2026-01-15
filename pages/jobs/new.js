import { useState } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "../../lib/supabase";

export default function NewJob() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Pending");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  const uploadImage = async (file) => {
    try {
      setUploading(true);

      const compressed = await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `private/${fileName}`;

      const { error } = await supabase.storage
        .from("job-images")
        .upload(filePath, compressed);

      if (error) throw error;

      const { data } = supabase.storage
        .from("job-images")
        .getPublicUrl(filePath);

      setImages((prev) => [...prev, data.publicUrl]);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const saveJob = async () => {
    const { error } = await supabase.from("jobs").insert({
      title,
      status,
      images,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Job saved successfully");
      setTitle("");
      setImages([]);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h1>Create New Job</h1>

      <div className="card">
        <label>Job Title</label>
        <input
          placeholder="Enter job name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>

        <button onClick={saveJob}>Save Job</button>
      </div>

      <div className="card">
        <h3>Upload Images</h3>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => uploadImage(e.target.files[0])}
        />

        {uploading && <p>Uploading...</p>}

        <div style={grid}>
          {images.map((img, i) => (
            <img key={i} src={img} style={image} />
          ))}
        </div>
      </div>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 140px)",
  gap: 12,
  marginTop: 10,
};

const image = {
  width: "100%",
  height: 120,
  objectFit: "cover",
  borderRadius: 8,
};
