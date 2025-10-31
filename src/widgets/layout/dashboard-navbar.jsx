import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  IconButton,
  Breadcrumbs,
  Button,
} from "@material-tailwind/react";
import { Bars3Icon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { clearSession, getUser } from "@/utils/auth";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const navigate = useNavigate();
  const user = getUser();

  const handleSignOut = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
      >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-1 capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to="/dashboard/home">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                Food Log App
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {page || "overview"}
          </Typography>
        </div>
        <div className="flex items-center">
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
          <div className="hidden flex-col items-end px-4 text-right xl:flex">
            <Typography variant="small" className="font-medium text-blue-gray-600">
              {user?.email || "Welcome back"}
            </Typography>
            <Typography variant="small" className="text-xs text-blue-gray-300">
              {user?.provider === "google"
                ? "Google sign-in"
                : user?.provider === "apple"
                ? "Apple sign-in"
                : "Email session"}
            </Typography>
          </div>
          <Button
            variant="text"
            color="blue-gray"
            className="hidden items-center gap-2 normal-case xl:flex"
            onClick={handleSignOut}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 text-blue-gray-500" />
            Sign Out
          </Button>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={handleSignOut}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
