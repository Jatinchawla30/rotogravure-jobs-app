import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function NewJob() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading || !user) return null;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Create New Job</h1>
      <p>Logged in as: {user.email}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}
