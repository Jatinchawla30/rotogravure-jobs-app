import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function NewJobPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [saving, setSaving] = useState(false);

  // 🔐 Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else {
        setUser(data.session.user);
        setLoading(false);
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("jobs").insert([
      {
        title,
        customer,
        description,
        status,
        created_by: user.id,
      },
    ]);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push("/jobs");
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1>Create New Job</h1>

      <p>Logged in as: {user.email}</p>

      <button
        onClick={() => supabase.auth.signOut()}
        style={{ marginBottom: 20 }}
      >
        Logout
      </button>

      <form onSubmit={handleSubmit}>
        <label>Job Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Customer</label>
        <input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          required
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Job"}
        </button>
      </form>

      <style jsx>{`
        label {
          display: block;
          margin-top: 16px;
          font-weight: 600;
        }
        input,
        textarea,
        select {
          width: 100%;
          padding: 8px;
          margin-top: 6px;
        }
        button {
          margin-top: 20px;
          padding: 10px 16px;
          background: #2563eb;
          color: white;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
