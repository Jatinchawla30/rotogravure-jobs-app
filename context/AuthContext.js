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
      if (!user) {
        setFirebaseUser(null);
        setUserDoc(null);
        setLoading(false);
        return;
      }

      setFirebaseUser(user);

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          // User exists in Auth but not in Firestore
          setUserDoc({
            email: user.email,
            name: user.email,
            role: "viewer",
            active: false,
          });

          setAccessError("Your account is not activated yet. Please contact admin.");

          // Redirect client-side only
          setTimeout(() => {
            signOut(auth);
            router.push("/login");
          }, 50);

        } else {
          const data = snap.data();

          if (!data.active) {
            setUserDoc(data);
            setAccessError("Your account is not activated. Please contact admin.");

            setTimeout(() => {
              signOut(auth);
              router.push("/login");
            }, 50);

          } else {
            setUserDoc(data);
            setAccessError("");
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setAccessError("Error loading user data.");
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

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user: userDoc,
        loading,
        accessError,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
