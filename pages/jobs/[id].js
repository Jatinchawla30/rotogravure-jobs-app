import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function JobDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState(null);
  const [cylinders, setCylinders] = useState([]);

  const [cylinderNo, setCylinderNo] = useState("");
  const [colour, setColour] = useState("");
  const [repeat, setRepeat] = useState("");
  const [webWidth, setWebWidth] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (id) {
      fetchJob();
      fetchCylinders();
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
      .eq("job_id", id)
      .order("created_at", { ascending: true });

    setCylinders(data || []);
  }

  async function addCylinder(e) {
    e.preventDefault();

    const { error } = await supabase.from("cylinders").insert({
      job_id: id,
      cylinder_no: cylinderNo,
      colour,
      repeat_length_mm: repeat || null,
      web_width_mm: webWidth || null,
      notes,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setCylinderNo("");
    setColour("");
    setRepeat("");
    setWebWidth("");
    setNotes("");

    fetchCylinders();
  }

  if (!job) return <p>Loading job...</p>;

  return (
    <div>
      <h1>
        Job {job.job_no} — {job.client}
      </h1>

      <h2 style={{ marginTop: 30 }}>Cylinders</h2>

      <table
        style={{
          width: "100%",
          background: "white",
          borderRadius: 8,
          marginBottom: 30,
        }}
      >
        <thead>
          <tr>
            <th style={th}>Cylinder No</th>
            <th style={th}>Colour</th>
            <th style={th}>Repeat (mm)</th>
            <th style={th}>Web Width (mm)</th>
            <th style={th}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {cylinders.map((c) => (
            <tr key={c.id}>
              <td style={td}>{c.cylinder_no}</td>
              <td style={td}>{c.colour}</td>
              <td style={td}>{c.repeat_length_mm}</td>
              <td style={td}>{c.web_width_mm}</td>
              <td style={td}>{c.notes}</td>
            </tr>
          ))}
          {cylinders.length === 0 && (
            <tr>
              <td colSpan="5" style={td}>
                No cylinders added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h3>Add Cylinder</h3>

      <form onSubmit={addCylinder} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Cylinder Number"
          value={cylinderNo}
          onChange={(e) => setCylinderNo(e.target.value)}
          required
        />
        <input
          placeholder="Colour / Shade"
          value={colour}
          onChange={(e) => setColour(e.target.value)}
          required
        />
        <input
          placeholder="Repeat Length (mm)"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
        />
        <input
          placeholder="Web Width (mm)"
          value={webWidth}
          onChange={(e) => setWebWidth(e.target.value)}
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: 10,
            borderRadius: 6,
          }}
        >
          Add Cylinder
        </button>
      </form>
    </div>
  );
}

const th = { padding: 10, textAlign: "left" };
const td = { padding: 10, borderTop: "1px solid #e5e7eb" };
