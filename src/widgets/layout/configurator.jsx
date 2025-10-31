import React, { useMemo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Switch, Typography } from "@material-tailwind/react";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setSidenavColor,
  setSidenavType,
  setFixedNavbar,
} from "@/context";

const SIDENAV_COLOR_OPTIONS = {
  dark: "from-slate-900 to-slate-900",
  white: "from-gray-200 to-gray-200",
  green: "from-emerald-400 to-emerald-600",
  blue: "from-blue-500 to-blue-700",
  red: "from-rose-500 to-rose-700",
  pink: "from-pink-400 to-pink-600",
};

const NAVBAR_TYPE_OPTIONS = [
  { label: "Dark", value: "dark" },
  { label: "Transparent", value: "transparent" },
  { label: "White", value: "white" },
];

const SHARE_LINKS = {
  twitter:
    "https://twitter.com/intent/tweet?text=I%20just%20tracked%20my%20meal%20using%20Food%20Log%20App%20by%20DANISA!",
  facebook: "https://www.facebook.com/sharer/sharer.php?u=https://foodlogapp.com",
};

export function Configurator() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openConfigurator, sidenavColor, sidenavType, fixedNavbar } =
    controller;

  const activeColorClass = useMemo(
    () =>
      ({
        dark: "border-white",
        white: "border-blue-gray-900",
        green: "border-emerald-100",
        blue: "border-blue-100",
        red: "border-rose-100",
        pink: "border-pink-100",
      }[sidenavColor] || "border-white"),
    [sidenavColor]
  );

  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-2.5 shadow-lg transition-transform duration-300 ${
        openConfigurator ? "translate-x-0" : "translate-x-96"
      }`}
    >
      <div className="flex items-start justify-between px-6 pt-8 pb-6">
        <div>
          <Typography variant="h5" color="blue-gray">
            Dashboard Configurator
          </Typography>
          <Typography className="font-normal text-blue-gray-600">
            Tweak the dashboard experience in real time.
          </Typography>
        </div>
        <IconButton
          variant="text"
          color="blue-gray"
          onClick={() => setOpenConfigurator(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>

      <div className="space-y-10 px-6 pb-10">
        <section>
          <Typography variant="h6" color="blue-gray">
            Sidenav Colors
          </Typography>
          <Typography variant="small" color="gray">
            Select an accent color for the navigation and charts.
          </Typography>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(SIDENAV_COLOR_OPTIONS).map(([key, gradient]) => (
              <button
                type="button"
                key={key}
                onClick={() => setSidenavColor(dispatch, key)}
                className={`h-8 w-8 rounded-full border-2 bg-gradient-to-br ${gradient} transition-transform hover:scale-110 ${
                  sidenavColor === key ? activeColorClass : "border-transparent"
                }`}
                aria-label={`Set sidenav color ${key}`}
              />
            ))}
          </div>
        </section>

        <section>
          <Typography variant="h6" color="blue-gray">
            Sidenav Types
          </Typography>
          <Typography variant="small" color="gray">
            Switch between dark, transparent, or white navigation styles.
          </Typography>
          <div className="mt-4 flex flex-wrap gap-3">
            {NAVBAR_TYPE_OPTIONS.map(({ label, value }) => (
              <Button
                key={value}
                variant={sidenavType === value ? "gradient" : "outlined"}
                color={sidenavType === value ? "blue" : "blue-gray"}
                className="capitalize"
                onClick={() => setSidenavType(dispatch, value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </section>

        <section className="border-t border-blue-gray-50 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h6" color="blue-gray">
                Navbar Fixed
              </Typography>
              <Typography variant="small" color="gray">
                Toggle a fixed navigation bar at the top of the screen.
              </Typography>
            </div>
            <Switch
              id="navbar-fixed"
              checked={fixedNavbar}
              ripple={false}
              onChange={(event) =>
                setFixedNavbar(dispatch, event.target.checked)
              }
            />
          </div>
        </section>

        <section className="border-t border-blue-gray-50 pt-6">
          <Typography variant="h6" color="blue-gray">
            Spread the Word
          </Typography>
          <Typography variant="small" color="gray">
            Share the Food Log App with your friends and colleagues.
          </Typography>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={SHARE_LINKS.twitter}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="gradient"
                color="light-blue"
                className="flex w-full items-center justify-center gap-2"
              >
                <i className="fab fa-twitter text-base" />
                Tweet
              </Button>
            </a>
            <a
              href={SHARE_LINKS.facebook}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="gradient"
                color="blue"
                className="flex w-full items-center justify-center gap-2"
              >
                <i className="fab fa-facebook text-base" />
                Share
              </Button>
            </a>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            Designed by{" "}
            <strong className="text-blue-600">DANISA Company</strong>
          </p>
        </section>
      </div>
    </aside>
  );
}

Configurator.displayName = "/src/widgets/layout/configurator.jsx";

export default Configurator;
