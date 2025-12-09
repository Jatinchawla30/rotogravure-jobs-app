import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import Link from "next/link";

export default function JobsListPage() {
  const { firebaseUser, user, loading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(data);
    });

    return () => unsub();
  }, [firebaseUser, loading, router]);

  if (loading) return <p>Loading...</p>;
  if (!firebaseUser) return null;

  return (
    <Layout>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Jobs</h1>
        {user && user.role !== "viewer" && (
          <button
            onClick={() => router.push("/jobs/new")}
            style={{
              padding: "8px 12px",
              backgroundColor: "#111827",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            + New Job
          </button>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Job No</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Brand</th>
              <th style={thStyle}>Design</th>
              <th style={thStyle}>No. of Colours</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td style={tdStyle}>{job.jobNumber}</td>
                <td style={tdStyle}>{job.customerName}</td>
                <td style={tdStyle}>{job.brandName}</td>
                <td style={tdStyle}>{job.designName}</td>
                <td style={tdStyle}>{job.numberOfColours}</td>
                <td style={tdStyle}>
                  <Link href={`/jobs/${job.id}`}>
                    <span
                      style={{ color: "#2563eb", cursor: "pointer" }}
                    >
                      View
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={6}>
                  No jobs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const thStyle = {
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  padding: "8px",
  backgroundColor: "#f9fafb",
  fontSize: "0.9rem",
};

const tdStyle = {
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  padding: "8px",
  fontSize: "0.9rem",
};
