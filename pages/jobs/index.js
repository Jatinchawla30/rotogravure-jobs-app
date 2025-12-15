import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

export default function JobsList() {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (!loading && user) {
      loadJobs();
    }
  }, [loading, user]);

  const loadJobs = async () => {
    const snap = await getDocs(collection(db, "jobs"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setJobs(list);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Jobs</h1>

      {user?.role !== "viewer" && (
        <Link href="/jobs/new">
          <button style={{ marginBottom: 20 }}>➕ New Job</button>
        </Link>
      )}

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Job No.</th>
            <th>Customer</th>
            <th>Design</th>
            <th>Colours</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.jobNumber}</td>
              <td>{job.customer}</td>
              <td>{job.design}</td>
              <td>{job.colours}</td>
              <td>
                <Link href={`/jobs/${job.id}`}>Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
