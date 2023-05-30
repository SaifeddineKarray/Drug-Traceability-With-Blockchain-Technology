import { useLocation, Navigate, Outlet } from "react-router-dom";
import { auth } from "../firebase-config";

const RequireAuth = (props) => {
    //console.log(auth.currentUser);
    const location = useLocation();
    return (
      (props.allowedRoles?.includes(props.role))
            ? <Outlet />
            : auth.currentUser
                ? <Navigate to="/unauthorized" state={{ from: location }} replace />
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;