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

    if (error) {
      alert(error.message);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Loading jobs...</p>;
  }

  return (
    <div>
      {/* Header */}
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

      {/* Jobs Table */}
      <table
        style={{
          width: "100%",
          background: "white",
          borderRadius: 8,
          overflow: "hidden",
          borderCollapse: "collapse",
        }}
      >
        <thead style={{ background: "#f1f5f9" }}>
          <tr>
            <th style={th}>Job No</th>
            <th style={th}>Client</th>
            <th style={th}>Status</th>
            <th style={th}>Created</th>
          </tr>
        </thead>

        <tbody>
          {jobs.length === 0 && (
            <tr>
              <td colSpan="4" style={td}>
                No jobs found
              </td>
            </tr>
          )}

          {jobs.map((job) => (
            <tr key={job.id}>
              {/* 🔗 THIS IS THE IMPORTANT LINK */}
              <td style={td}>
                <Link href={`/jobs/${job.id}`}>
                  <span style={{ color: "#2563eb", cursor: "pointer" }}>
                    {job.job_no}
                  </span>
                </Link>
              </td>

              <td style={td}>{job.client}</td>
              <td style={td}>{job.status}</td>
              <td style={td}>
                {new Date(job.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  padding: 12,
  textAlign: "left",
  fontWeight: 600,
};

const td = {
  padding: 12,
  borderTop: "1px solid #e5e7eb",
};
