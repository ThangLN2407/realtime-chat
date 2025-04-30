import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

interface Props {
  readonly children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [user, loading] = useAuthState(auth);
  console.log(
    "%c🤪 ~ file: ProtectedRoute.tsx:12 [] -> user : ",
    "color: #16ed1d",
    user
  );

  if (loading) return <div>Đang xác minh danh tính...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
