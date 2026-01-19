export default function Dashboard() {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        <Card title="Active Jobs" value="12" />
        <Card title="Completed Jobs" value="86" />
        <Card title="Pending Approval" value="4" />
        <Card title="Users" value="7" />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ color: "#64748b" }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}
