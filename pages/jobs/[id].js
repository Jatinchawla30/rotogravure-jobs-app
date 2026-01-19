import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function JobDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState(null);
  const [cylinders, setCylinders] = useState([]);
  const [materials, setMaterials] =_toggle([]);
  const [newMaterial, setNewMaterial] = useState("");

  const [cylinderNo, setCylinderNo] = useState("");
  const [colour, setColour] = useState("");

  useEffect(() => {
    if (id) {
      fetchJob();
      fetchCylinders();
      fetchMaterials();
    }
  }, [id]);

  async function fetchJob() {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    setJob(data);
  }

  async function fetchCylinders() {
    const { data } = await supabase
      .from("cylinders")
      .select("*")
      .eq("job_id", id);

    setCylinders(data || []);
  }

  async function fetchMaterials() {
    const { data } = await supabase
      .from("job_materials")
      .select("*")
      .eq("job_id", id);

    setMaterials(data || []);
  }

  async function addMaterial(e) {
    e.preventDefault();

    const { error } = await supabase.from("job_materials").insert({
      job_id: id,
      material: newMaterial,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNewMaterial("");
    fetchMaterials();
  }

  async function addCylinder(e) {
    e.preventDefault();

    const { error } = await supabase.from("cylinders").insert({
      job_id: id,
      cylinder_no: cylinderNo,
      colour,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setCylinderNo("");
    setColour("");
    fetchCylinders();
  }

  if (!job) return <p>Loading job...</p>;

  return (
    <div>
      <h1>
        Job {job.job_no} — {job.client}
      </h1>

      {/* MATERIALS */}
      <h2 style={{ marginTop: 30 }}>Materials Used</h2>

      <ul>
        {materials.map((m) => (
          <li key={m.id}>{m.material}</li>
        ))}
        {materials.length === 0 && <li>No materials added</li>}
      </ul>

      <form onSubmit={addMaterial} style={{ marginBottom: 30 }}>
        <input
          placeholder="Material (PET, BOPP, etc.)"
          value={newMaterial}
          onChange={(e) => setNewMaterial(e.target.value)}
          required
        />
        <button style={{ marginLeft: 10 }}>Add Material</button>
      </form>

      {/* CYLINDERS */}
      <h2>Cylinders</h2>

      <table style={{ width: "100%", background: "white" }}>
        <thead>
          <tr>
            <th>Cylinder No</th>
            <th>Colour</th>
          </tr>
        </thead>
        <tbody>
          {cylinders.map((c) => (
            <tr key={c.id}>
              <td>{c.cylinder_no}</td>
              <td>{c.colour}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={addCylinder} style={{ marginTop: 20 }}>
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
        <button style={{ marginLeft: 10 }}>Add Cylinder</button>
      </form>
    </div>
  );
}
