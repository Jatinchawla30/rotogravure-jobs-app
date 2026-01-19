import Link from "next/link";

export default function JobsPage() {
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

      <table
        style={{
          width: "100%",
          background: "white",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ background: "#f1f5f9" }}>
          <tr>
            <th style={th}>Job No</th>
            <th style={th}>Client</th>
            <th style={th}>Status</th>
            <th style={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          <JobRow job="RG-1021" client="Nestle" status="Running" />
          <JobRow job="RG-1022" client="ITC" status="Completed" />
        </tbody>
      </table>
    </div>
  );
}

function JobRow({ job, client, status }) {
  return (
    <tr>
      <td style={td}>{job}</td>
      <td style={td}>{client}</td>
      <td style={td}>{status}</td>
      <td style={td}>
        <a href={`/jobs/${job}`} style={{ color: "#2563eb" }}>
          View
        </a>
      </td>
    </tr>
  );
}

const th = { padding: 12, textAlign: "left" };
const td = { padding: 12, borderTop: "1px solid #e5e7eb" };
