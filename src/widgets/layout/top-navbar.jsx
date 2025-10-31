import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import routes from "@/routes";
import { clearSession, getUser } from "@/utils/auth";

const dashboardRoutes = routes.find(({ layout }) => layout === "dashboard")?.pages || [];

export function TopNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav, sidenavType, sidenavColor, fixedNavbar } = controller;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (openSidenav) {
      setOpenSidenav(dispatch, false);
    }
  }, [pathname, dispatch, openSidenav]);

  const navItems = useMemo(
    () =>
      dashboardRoutes.map(({ path, name }) => ({
        path,
        label: name.replace(/\b\w/g, (char) => char.toUpperCase()),
      })),
    []
  );

  const isActive = (path) => {
    if (path === "/dashboard/home") {
      return pathname === "/" || pathname === path;
    }
    return pathname.startsWith(path);
  };

  const handleToggle = () => setOpenSidenav(dispatch, !openSidenav);

  const handleSignOut = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  const navbarThemeClasses = useMemo(() => {
    switch (sidenavType) {
      case "dark":
        return "bg-blue-gray-900 text-white shadow-xl";
      case "transparent":
        return "bg-white/70 backdrop-blur-md text-blue-gray-800 shadow-sm";
      case "white":
      default:
        return "bg-white text-blue-gray-800 shadow-md";
    }
  }, [sidenavType]);

  const activePillClasses = useMemo(() => {
    const colorMap = {
      dark: "bg-blue-gray-900 text-white",
      white: "bg-blue-600 text-white",
      green: "bg-emerald-500 text-white",
      orange: "bg-orange-500 text-white",
      red: "bg-rose-500 text-white",
      pink: "bg-pink-500 text-white",
    };
    return colorMap[sidenavColor] || "bg-blue-gray-900 text-white";
  }, [sidenavColor]);

  const navPositionClasses = fixedNavbar
    ? "fixed inset-x-0 top-0"
    : "relative w-full";

  return (
    <nav className={`${navPositionClasses} z-50 ${navbarThemeClasses}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/dashboard/home" className="flex items-center gap-3">
          <img
            src="/img/logo.png"
            alt="Food Log App"
            className="h-10 w-10 rounded-full object-contain"
          />
          <Typography variant="h5" className="font-semibold text-blue-gray-800">
            Food Log App
          </Typography>
        </Link>
        <div className="hidden items-center gap-3 lg:flex">
          {navItems.map(({ path, label }) => (
            <Link key={path} to={path}>
              <span
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                  isActive(path)
                    ? `${activePillClasses} shadow`
                    : "text-blue-gray-600 hover:bg-blue-gray-50"
                }`}
              >
                {label}
              </span>
            </Link>
          ))}
          <Button
            variant="filled"
            color="blue-gray"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full bg-blue-gray-800 normal-case"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        <div className="flex items-center gap-3 lg:hidden">
          {user?.email && (
            <Typography variant="small" className="text-blue-gray-500">
              {user.email}
            </Typography>
          )}
          <IconButton variant="text" color="blue-gray" onClick={handleToggle}>
            {openSidenav ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </IconButton>
        </div>
      </div>
      {openSidenav && (
        <div className="border-t border-blue-gray-50 bg-white px-4 pb-4 lg:hidden">
          <div className="flex flex-col gap-2">
          {navItems.map(({ path, label }) => (
            <Link key={path} to={path} onClick={handleToggle}>
              <span
                className={`block rounded-xl px-4 py-3 text-sm font-medium capitalize ${
                  isActive(path)
                    ? `${activePillClasses} shadow`
                    : "text-blue-gray-600 hover:bg-blue-gray-50"
                }`}
              >
                {label}
              </span>
            </Link>
          ))}
            <Button
              variant="outlined"
              color="blue-gray"
              onClick={() => {
                handleToggle();
                handleSignOut();
              }}
              className="flex items-center justify-center gap-2 rounded-full border-blue-gray-200 text-blue-gray-700"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}


TopNavbar.displayName = "/src/widgets/layout/top-navbar.jsx";

export default TopNavbar;







