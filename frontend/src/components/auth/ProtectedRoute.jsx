import { Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Wordmark from "../ui/Wordmark";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ivory">
        <div className="flex flex-col items-center gap-5">
          <Wordmark />
          <Loader2 className="h-5 w-5 animate-spin text-sage" />
          <p className="text-[10px] uppercase tracking-wide2 text-muted-gray">
            Opening your private desk
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    const params = new URLSearchParams({ redirect: location.pathname });
    return <Navigate to={`/auth?${params.toString()}`} replace />;
  }

  return children;
}
