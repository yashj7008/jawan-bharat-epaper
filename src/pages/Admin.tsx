import { Navigate } from 'react-router-dom';

/** @deprecated Use /admin routes via AdminLayout */
export function Admin() {
  return <Navigate to="/admin" replace />;
}
