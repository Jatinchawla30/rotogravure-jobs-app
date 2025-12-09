import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setUserDoc(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          setUserDoc({
            role: "viewer",
            active: false,
            name: user.email || "",
            email: user.email || "",
          });
          setAccessError(
            "Your account is not activated yet. Please contact admin."
          );
          await signOut(auth);
        } else {
          const data = snap.data();
          if (data.active === false) {
            setUserDoc(data);
            setAccessError(
              "Your account is deactivated. Please contact admin."
            );
            await signOut(auth);
          } else {
            setUserDoc(data);
            setAccessError("");
          }
        }
      } catch (err) {
        console.error("Error loading user doc:", err);
        setAccessError("Error loading user data. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setUserDoc(null);
    router.push("/login");
  };

  const value = {
    firebaseUser,
    user: userDoc,
    loading,
    accessError,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
