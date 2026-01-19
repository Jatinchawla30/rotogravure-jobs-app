import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function NewJobPage() {
  const router = useRouter();
  const [jobNo, setJobNo] = useState("");
  const [client, setClient] = useState("");
  const [status, setStatus] = useState("Running");
  const [saving, setSaving] = useState(false);

  async function saveJob(e) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("jobs").insert([
      {
        job_no: jobNo,
        client,
        status,
      },
    ]);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push("/jobs");
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h1>Create New Job</h1>

      <form onSubmit={saveJob} style={{ display: "grid", gap: 15 }}>
        <input
          placeholder="Job Number (e.g. RG-1024)"
          value={jobNo}
          onChange={(e) => setJobNo(e.target.value)}
          required
        />

        <input
          placeholder="Client Name"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          required
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>Running</option>
          <option>Completed</option>
          <option>Pending</option>
        </select>

        <button
          disabled={saving}
          style={{
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: 6,
          }}
        >
          {saving ? "Saving..." : "Save Job"}
        </button>
      </form>
    </div>
  );
}
