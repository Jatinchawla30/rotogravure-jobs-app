import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function JobDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setJob(data);
  };

  if (!job) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>{job.title}</h2>
      <p>Status: {job.status || "N/A"}</p>
    </div>
  );
}
