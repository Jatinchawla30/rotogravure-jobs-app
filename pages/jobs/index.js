import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

export default function Jobs() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) loadJobs();
  }, [user]);

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setJobs(data);
  };

  if (loading || !user) return null;

  return (
    <div style={{ padding: 40 }}>
      <h1>Jobs</h1>

      <Link href="/jobs/new">
        <button style={{ marginBottom: 20 }}>+ New Job</button>
      </Link>

      {jobs.length === 0 && <p>No jobs yet</p>}

      {jobs.map((job) => (
        <div
          key={job.id}
          style={{
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <h3>{job.title}</h3>
          <p>Status: {job.status || "N/A"}</p>

          <Link href={`/jobs/${job.id}`}>
            View details →
          </Link>
        </div>
      ))}
    </div>
  );
}
