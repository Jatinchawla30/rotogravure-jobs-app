import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (!error) setUsers(data);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Users</h2>

      {users.map((u) => (
        <div key={u.id}>
          {u.email} — {u.role}
        </div>
      ))}
    </div>
  );
}
