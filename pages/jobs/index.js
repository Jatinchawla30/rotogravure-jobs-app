import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setJobs(data);
    setLoading(false);
  }

  if (loading) return <p>Loading jobs...</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1>Jobs</h1>

        <Link href="/jobs/new">
          <button
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            + Add Job
          </button>
        </Link>
      </div>

      {jobs.length === 0 && <p>No jobs found.</p>}

      <table
        style={{
          width: "100%",
          background: "white",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <thead style={{ background: "#f1f5f9" }}>
          <tr>
            <th style={th}>Job No</th>
            <th style={th}>Client</th>
            <th style={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td style={td}>{job.job_no}</td>
              <td style={td}>{job.client}</td>
              <td style={td}>{job.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: 12, textAlign: "left" };
const td = { padding: 12, borderTop: "1px solid #e5e7eb" };
