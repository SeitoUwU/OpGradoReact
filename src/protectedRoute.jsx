import { Navigate } from "react-router-dom";
function ProtectedRoute({ children }) {
    const isAutenticated = localStorage.getItem('token');
    if (!isAutenticated) {
        return <Navigate to='/' replace/>
    }
    return children;
}
export default ProtectedRoute;