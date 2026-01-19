import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Layout({ children, user }) {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "#0f172a",
          color: "white",
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 30 }}>Rotogravure</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/jobs/new">Create Job</Link>
          <Link href="/admin/users">Users</Link>
        </nav>

        <button
          onClick={logout}
          style={{
            marginTop: 40,
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, background: "#f8fafc", padding: 30 }}>
        <div style={{ marginBottom: 20, color: "#475569" }}>
          Logged in as: <strong>{user?.email}</strong>
        </div>

        {children}
      </main>
    </div>
  );
}
