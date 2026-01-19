import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function JobDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [images, setImages] = useState([]);

  const [newMaterial, setNewMaterial] = useState("");
  const [cylinderNo, setCylinderNo] = useState("");
  const [colour, setColour] = useState("");

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
      fetchMaterials();
      fetchCylinders();
      fetchImages();
    }
  }, [id]);

  async function fetchJob() {
    const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
    setJob(data);
  }

  async function fetchMaterials() {
    const { data } = await supabase
      .from("job_materials")
      .select("*")
      .eq("job_id", id);
    setMaterials(data || []);
  }

  async function fetchCylinders() {
    const { data } = await supabase
      .from("cylinders")
      .select("*")
      .eq("job_id", id);
    setCylinders(data || []);
  }

  async function fetchImages() {
    const { data } = await supabase
      .from("job_images")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: false });
    setImages(data || []);
  }

  async function addMaterial(e) {
    e.preventDefault();
    await supabase.from("job_materials").insert({
      job_id: id,
      material: newMaterial,
    });
    setNewMaterial("");
    fetchMaterials();
  }

  async function addCylinder(e) {
    e.preventDefault();
    await supabase.from("cylinders").insert({
      job_id: id,
      cylinder_no: cylinderNo,
      colour,
    });
    setCylinderNo("");
    setColour("");
    fetchCylinders();
  }

  async function uploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const filePath = `${id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("job-images")
      .upload(filePath, file);

    if (error) {
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("job-images")
      .getPublicUrl(filePath);

    await supabase.from("job_images").insert({
      job_id: id,
      image_url: data.publicUrl,
    });

    setUploading(false);
    fetchImages();
  }

  if (!job) return <p>Loading job...</p>;

  return (
    <div>
      <h1>
        Job {job.job_no} — {job.client}
      </h1>

      {/* MATERIALS */}
      <h2>Materials Used</h2>
      <ul>
        {materials.map((m) => (
          <li key={m.id}>{m.material}</li>
        ))}
      </ul>

      <form onSubmit={addMaterial}>
        <input
          placeholder="Material (PET, BOPP, etc.)"
          value={newMaterial}
          onChange={(e) => setNewMaterial(e.target.value)}
          required
        />
        <button>Add</button>
      </form>

      {/* CYLINDERS */}
      <h2 style={{ marginTop: 30 }}>Cylinders</h2>
      <table>
        <tbody>
          {cylinders.map((c) => (
            <tr key={c.id}>
              <td>{c.cylinder_no}</td>
              <td>{c.colour}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={addCylinder}>
        <input
          placeholder="Cylinder No"
          value={cylinderNo}
          onChange={(e) => setCylinderNo(e.target.value)}
          required
        />
        <input
          placeholder="Colour"
          value={colour}
          onChange={(e) => setColour(e.target.value)}
          required
        />
        <button>Add Cylinder</button>
      </form>

      {/* IMAGES */}
      <h2 style={{ marginTop: 30 }}>Job Images</h2>

      <input type="file" accept="image/*" onChange={uploadImage} />

      {uploading && <p>Uploading image...</p>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        {images.map((img) => (
          <img
            key={img.id}
            src={img.image_url}
            alt="Job"
            style={{ width: 150, borderRadius: 6 }}
          />
        ))}
      </div>
    </div>
  );
}
