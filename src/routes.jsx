import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/solid";
import FoodLogDashboard from "@/pages/FoodLogDashboard";
import Profile from "@/pages/Profile";
import { Tables } from "@/pages/dashboard";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "food log",
        path: "/dashboard/home",
        element: <FoodLogDashboard />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "calorie history",
        path: "/dashboard/tables",
        element: <Tables />,
      },
    ],
  },
];

export default routes;
