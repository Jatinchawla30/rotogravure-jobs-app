import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (firebaseUser) router.replace("/jobs");
    else router.replace("/login");
  }, [firebaseUser, loading, router]);

  return <p>Loading...</p>;
}
