import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <header
        style={{
          backgroundColor: "#111827",
          color: "white",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Link href="/jobs">
            <span style={{ fontWeight: "bold", cursor: "pointer" }}>
              Rotogravure Jobs
            </span>
          </Link>
        </div>
        <nav style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          {user && (
            <>
              <Link href="/jobs">
                <span style={{ cursor: "pointer" }}>Jobs</span>
              </Link>
              {user.role === "admin" && (
                <Link href="/admin/users">
                  <span style={{ cursor: "pointer" }}>Users</span>
                </Link>
              )}
              <span style={{ fontSize: "0.9rem" }}>
                {user.name || user.email} ({user.role})
              </span>
              <button
                onClick={logout}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: "1px solid #4b5563",
                  background: "#f9fafb",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </header>
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}
