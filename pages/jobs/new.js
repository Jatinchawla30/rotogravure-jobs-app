export default function NewJob() {
  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ marginBottom: 20 }}>Create New Job</h1>

      <form style={{ display: "grid", gap: 15 }}>
        <input placeholder="Job Name" />
        <input placeholder="Client Name" />
        <select>
          <option>Status</option>
          <option>Running</option>
          <option>Completed</option>
        </select>

        <button
          style={{
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: 6,
          }}
        >
          Save Job
        </button>
      </form>
    </div>
  );
}
