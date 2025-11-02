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
    setOpenSidenav(dispatch, false);
  }, [pathname, dispatch]);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", openSidenav);
    return () => document.body.classList.remove("overflow-hidden");
  }, [openSidenav]);

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
        return "bg-[var(--food-primary-dark)] text-white shadow-xl";
      case "transparent":
        return "bg-white/70 backdrop-blur-md text-slate-800 shadow-sm";
      case "white":
      default:
        return "bg-white/90 text-slate-800 shadow-md shadow-orange-100/60 backdrop-blur";
    }
  }, [sidenavType]);

  const activePillClasses = useMemo(() => {
    const colorMap = {
      dark: "bg-white/20 text-white",
      white: "bg-[var(--food-primary)] text-white",
      green: "bg-emerald-500 text-white",
      orange: "bg-orange-500 text-white",
      red: "bg-rose-500 text-white",
      pink: "bg-pink-500 text-white",
    };
    return (
      colorMap[sidenavColor] || "bg-[var(--food-primary)] text-white"
    );
  }, [sidenavColor]);

  const navPositionClasses = fixedNavbar
    ? "fixed top-0 left-0 right-0 xl:left-80"
    : "relative w-full xl:ml-80";

  return (
    <nav
      className={`${navPositionClasses} z-50 ${navbarThemeClasses} xl:pl-0`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/dashboard/home" className="flex items-center gap-3">
          <img
            src="/icons/food-log-icon-64.png"
            alt="Food Log App"
            className="h-10 w-10 rounded-2xl object-cover shadow-md shadow-orange-200/50"
          />
          <div>
            <Typography variant="h5" className="font-semibold text-[var(--food-primary-dark)]">
              Food Log App
            </Typography>
            <Typography variant="small" className="hidden text-sm text-slate-500 sm:block">
              Capture meals & stay on track
            </Typography>
          </div>
        </Link>
        <div className="hidden lg:flex">
          <Button
            variant="filled"
            color="orange"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-full bg-[var(--food-primary)] normal-case shadow-orange-300/50 hover:bg-[var(--food-primary-dark)]"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        <div className="flex items-center gap-3 lg:hidden">
          {user?.email && (
            <Typography variant="small" className="text-slate-500">
              {user.email}
            </Typography>
          )}
          <IconButton
            variant="text"
            color="blue-gray"
            className="text-[var(--food-primary-dark)]"
            onClick={handleToggle}
          >
            {openSidenav ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </IconButton>
        </div>
      </div>
    </nav>
  );
}


TopNavbar.displayName = "/src/widgets/layout/top-navbar.jsx";

export default TopNavbar;


