import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setJobs(data || []));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1>Jobs</h1>

      <Link href="/jobs/new">➕ Add New Job</Link>

      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <strong>{job.title}</strong> — {job.customer} ({job.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
