import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function NewJob() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const createJob = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("jobs")
      .insert([{ title }]);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      router.push("/jobs");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Create Job</h2>

      <input
        placeholder="Job title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 10, width: 300 }}
      />

      <br /><br />

      <button onClick={createJob} disabled={loading}>
        {loading ? "Saving..." : "Save Job"}
      </button>
    </div>
  );
}
