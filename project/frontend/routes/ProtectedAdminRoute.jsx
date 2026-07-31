import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/api';

const ProtectedAdminRoute = ({ children }) => {
    const user = getCurrentUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedAdminRoute;
