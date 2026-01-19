import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function JobDetailsPage() {
  const { id } = useRouter().query;

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
      supabase.from("jobs").select("*").eq("id", id).single().then(r => setJob(r.data));
      supabase.from("job_materials").select("*").eq("job_id", id).then(r => setMaterials(r.data || []));
      supabase.from("cylinders").select("*").eq("job_id", id).then(r => setCylinders(r.data || []));
      supabase.from("job_images").select("*").eq("job_id", id).then(r => setImages(r.data || []));
    }
  }, [id]);

  async function addMaterial(e) {
    e.preventDefault();
    await supabase.from("job_materials").insert({ job_id: id, material: newMaterial });
    setNewMaterial("");
    const { data } = await supabase.from("job_materials").select("*").eq("job_id", id);
    setMaterials(data);
  }

  async function addCylinder(e) {
    e.preventDefault();
    await supabase.from("cylinders").insert({ job_id: id, cylinder_no: cylinderNo, colour });
    setCylinderNo("");
    setColour("");
    const { data } = await supabase.from("cylinders").select("*").eq("job_id", id);
    setCylinders(data);
  }

  async function uploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const path = `${id}/${Date.now()}-${file.name}`;
    await supabase.storage.from("job-images").upload(path, file);
    const { data } = supabase.storage.from("job-images").getPublicUrl(path);

    await supabase.from("job_images").insert({ job_id: id, image_url: data.publicUrl });
    const imgs = await supabase.from("job_images").select("*").eq("job_id", id);
    setImages(imgs.data || []);
    setUploading(false);
  }

  if (!job) return <p>Loading…</p>;

  return (
    <div>
      <h1>Job {job.job_no} — {job.client}</h1>

      <div className="card">
        <h2>Materials Used</h2>
        <ul>
          {materials.map(m => <li key={m.id}>{m.material}</li>)}
        </ul>

        <form onSubmit={addMaterial}>
          <input placeholder="PET / BOPP / METPET" value={newMaterial} onChange={e => setNewMaterial(e.target.value)} />
          <button>Add Material</button>
        </form>
      </div>

      <div className="card">
        <h2>Cylinders</h2>
        <table width="100%">
          <tbody>
            {cylinders.map(c => (
              <tr key={c.id}>
                <td>{c.cylinder_no}</td>
                <td>{c.colour}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={addCylinder}>
          <input placeholder="Cylinder No" value={cylinderNo} onChange={e => setCylinderNo(e.target.value)} />
          <input placeholder="Colour" value={colour} onChange={e => setColour(e.target.value)} />
          <button>Add Cylinder</button>
        </form>
      </div>

      <div className="card">
        <h2>Images</h2>
        <input type="file" onChange={uploadImage} />
        {uploading && <p>Uploading…</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {images.map(img => (
            <img key={img.id} src={img.image_url} width="120" />
          ))}
        </div>
      </div>

      <ExportButton job={job} materials={materials} cylinders={cylinders} />
    </div>
  );
}

function ExportButton({ job, materials, cylinders }) {
  function exportJob() {
    const content = `
JOB NO: ${job.job_no}
CLIENT: ${job.client}

MATERIALS:
${materials.map(m => "- " + m.material).join("\n")}

CYLINDERS:
${cylinders.map(c => `- ${c.cylinder_no} (${c.colour})`).join("\n")}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Job-${job.job_no}.txt`;
    a.click();
  }

  return (
    <button className="secondary" onClick={exportJob}>
      Export Job Sheet
    </button>
  );
}
