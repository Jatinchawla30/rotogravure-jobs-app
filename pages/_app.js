import "../styles/globals.css";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

function AppContent({ Component, pageProps }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Pages like login/signup should not show sidebar
  if (
    Component.noLayout ||
    Component.name === "Login" ||
    Component.name === "Signup"
  ) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout user={user}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default function MyApp(props) {
  return (
    <AuthProvider>
      <AppContent {...props} />
    </AuthProvider>
  );
}
