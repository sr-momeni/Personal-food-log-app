import { Outlet } from "react-router-dom";

export function Auth() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white transition-colors duration-300">
      <Outlet />
    </div>
  );
}

Auth.displayName = "/src/layout/Auth.jsx";

export default Auth;
