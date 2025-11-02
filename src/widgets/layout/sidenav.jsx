import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

const BUTTON_COLOR_MAP = {
  dark: "orange",
  white: "orange",
  green: "green",
  blue: "blue",
  red: "red",
  pink: "pink",
};

const resolveButtonColor = (color) =>
  BUTTON_COLOR_MAP[color] || "blue-gray";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-[var(--food-primary-dark)] via-[var(--food-primary)] to-[#fb923c]",
    white: "bg-white shadow-sm",
    transparent: "bg-gradient-to-b from-white/80 via-white/70 to-white/60",
  };

  const handleClose = () => setOpenSidenav(dispatch, false);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          openSidenav
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        } xl:hidden`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside
        className={`${sidenavTypes[sidenavType]} ${
          openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed top-4 left-4 z-50 h-[calc(100vh-32px)] w-72 rounded-3xl border border-white/40 shadow-xl shadow-orange-300/30 transition-transform duration-300 xl:translate-x-0`}
      >
        <div className="relative">
          <Link to="/dashboard/home" className="py-6 px-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <img
                src="/icons/food-log-icon-64.png"
                alt="Food Log App"
                className="h-14 w-14 rounded-2xl border border-white/40 shadow-lg shadow-orange-200/40"
              />
              <Typography
                variant="h6"
                className={`${
                  sidenavType === "dark"
                    ? "text-white"
                    : "text-[var(--food-primary-dark)]"
                } font-semibold`}
              >
                {brandName}
              </Typography>
            </div>
          </Link>
          <IconButton
            variant="text"
            color="white"
            size="sm"
            ripple={false}
            className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
            onClick={handleClose}
          >
            <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
          </IconButton>
        </div>
        <div className="m-4 space-y-6">
          {routes.map(({ layout, title, pages }, key) => (
            <ul key={key} className="flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mb-2">
                  <Typography
                    variant="small"
                    className={`${
                      sidenavType === "dark"
                        ? "text-white/80"
                        : "text-slate-500"
                    } font-black uppercase tracking-wide`}
                  >
                    {title}
                  </Typography>
                </li>
              )}
              {pages.map(({ icon, name, path }) => (
                <li key={name}>
                  <NavLink to={path} onClick={() => openSidenav && handleClose()}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={
                          isActive
                            ? resolveButtonColor(sidenavColor)
                            : sidenavType === "dark"
                            ? "white"
                            : "blue-gray"
                        }
                        className={`flex items-center gap-4 px-4 py-2 capitalize ${
                          isActive
                            ? "bg-white/20 text-white"
                            : sidenavType === "dark"
                            ? "text-orange-50"
                            : "text-slate-600"
                        }`}
                        fullWidth
                      >
                        {icon}
                        <Typography
                          color="inherit"
                          className="font-medium capitalize"
                        >
                          {name}
                        </Typography>
                      </Button>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </aside>
    </>
  );
}

Sidenav.defaultProps = {
  brandImg: "/icons/food-log-icon-64.png",
  brandName: "Food Log App",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
