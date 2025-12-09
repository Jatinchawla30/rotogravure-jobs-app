import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function UsersAdminPage() {
  const { firebaseUser, user, loading } = useAuth();
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }
    if (!user || user.role !== "admin") {
      alert("You must be admin to view this page.");
      router.replace("/jobs");
      return;
    }

    const loadUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsersList(arr);
    };

    loadUsers();
  }, [firebaseUser, loading, user, router]);

  const handleChange = (id, field, value) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  const handleSave = async (id) => {
    const u = usersList.find((x) => x.id === id);
    if (!u) return;
    setSavingId(id);
    try {
      const ref = doc(db, "users", id);
      await updateDoc(ref, {
        role: u.role,
        active: Boolean(u.active),
        name: u.name,
      });
      alert("User updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    } finally {
      setSavingId(null);
    }
  };

  if (loading || !user || user.role !== "admin") return <p>Loading...</p>;

  return (
    <Layout>
      <h1 style={{ marginBottom: "16px" }}>Users</h1>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Active</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>
                  <input
                    type="text"
                    value={u.name || ""}
                    onChange={(e) =>
                      handleChange(u.id, "name", e.target.value)
                    }
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleChange(u.id, "role", e.target.value)
                    }
                  >
                    <option value="admin">admin</option>
                    <option value="operator">operator</option>
                    <option value="viewer">viewer</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={u.active ?? false}
                    onChange={(e) =>
                      handleChange(u.id, "active", e.target.checked)
                    }
                  />
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleSave(u.id)}
                    disabled={savingId === u.id}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      border: "1px solid #4b5563",
                      backgroundColor: "#f9fafb",
                      cursor: "pointer",
                    }}
                  >
                    {savingId === u.id ? "Saving..." : "Save"}
                  </button>
                </td>
              </tr>
            ))}
            {usersList.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={5}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const thStyle = {
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  padding: "8px",
  backgroundColor: "#f9fafb",
  fontSize: "0.9rem",
};

const tdStyle = {
  borderBottom: "1px solid #e5e7eb",
  textAlign: "left",
  padding: "8px",
  fontSize: "0.9rem",
};
