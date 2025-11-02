import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
} from "@material-tailwind/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useMeal } from "@/context/meal";
import { useMaterialTailwindController } from "@/context";
import { CalorieHistoryCard } from "@/widgets/cards";
import { resolveBackendImage } from "@/api";
import { MealCaptureDialog } from "@/components/meal-capture/MealCaptureDialog";
import {
  computeWeeklySeries,
  formatMealDate,
  parseMealDate,
} from "@/utils/meals";

const colorPalette = {
  dark: { primary: "#f97316", secondary: "#fb923c" },
  white: { primary: "#f97316", secondary: "#22d3ee" },
  green: { primary: "#10b981", secondary: "#34d399" },
  blue: { primary: "#0ea5e9", secondary: "#38bdf8" },
  red: { primary: "#f97316", secondary: "#fb923c" },
  pink: { primary: "#ec4899", secondary: "#f472b6" },
  default: { primary: "#f97316", secondary: "#22d3ee" },
};

export default function FoodLogDashboard() {
  const { setCapture, setAnalysis, meals, mealsLoading, mealsError } = useMeal();
  const [controller] = useMaterialTailwindController();
  const { sidenavColor } = controller;
  const navigate = useNavigate();

  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  const openCaptureDialog = () => setIsCaptureOpen(true);
  const closeCaptureDialog = () => setIsCaptureOpen(false);

  const handleCaptureConfirm = async ({ file, previewUrl }) => {
    setCapture({ file, previewUrl });
    setAnalysis(null);
    navigate("/processing");
  };

  const recentMeals = useMemo(() => {
    if (!Array.isArray(meals) || !meals.length) return [];

    return [...meals]
      .map((item, index) => {
        const dateValue = item.date || item.created_at || "";
        const parsedDate = parseMealDate(dateValue);
        const sortTime = parsedDate ? parsedDate.getTime() : index * -1;
        return {
          id: item.id || `${item.name || "meal"}-${index}`,
          name: item.name || "Meal",
          calories: item.calories ?? "-",
          date: formatMealDate(dateValue),
          sortTime,
          image: resolveBackendImage(
            item.image || item.image_url || item.filename
          ),
        };
      })
      .sort((a, b) => b.sortTime - a.sortTime)
      .slice(0, 3);
  }, [meals]);

  const historyError = useMemo(() => {
    if (mealsError) return mealsError;
    if (!mealsLoading && !recentMeals.length) return "No meal data available.";
    return "";
  }, [mealsError, mealsLoading, recentMeals.length]);

  const weeklySeries = useMemo(
    () => computeWeeklySeries(meals),
    [meals]
  );

  const chartTheme = colorPalette[sidenavColor] || colorPalette.default;

  const chartConfig = useMemo(
    () => ({
      type: "area",
      height: 280,
      series: [
        {
          name: "Calories",
          data: weeklySeries,
        },
      ],
      options: {
        chart: {
          toolbar: { show: false },
          foreColor: "#4f5464",
        },
        stroke: {
          curve: "smooth",
          width: 3,
        },
        colors: [chartTheme.primary],
        dataLabels: { enabled: false },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 0.8,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            colorStops: [
              {
                offset: 0,
                color: chartTheme.primary,
                opacity: 0.45,
              },
              {
                offset: 100,
                color: chartTheme.secondary,
                opacity: 0.05,
              },
            ],
          },
        },
        grid: {
          borderColor: "#e9edf5",
          strokeDashArray: 6,
        },
        xaxis: {
          categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          labels: { style: { fontSize: "12px", fontWeight: 500 } },
          axisBorder: { color: "#d5dae5" },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            formatter: (value) => `${value} kcal`,
            style: { fontSize: "12px", fontWeight: 500 },
          },
        },
        tooltip: {
          theme: "light",
          y: {
            formatter: (value) => `${value} kcal`,
          },
        },
      },
    }),
    [chartTheme, weeklySeries]
  );

  return (
    <>
      <div className="space-y-8 pb-32 sm:pb-28">
        <Card className="border border-orange-100/60 bg-white/80 shadow-lg shadow-orange-100/60">
          <CardHeader
            floated={false}
            shadow={false}
            className="rounded-none px-4 py-5 sm:px-6"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Typography variant="h5" className="text-[var(--food-primary-dark)]">
                  Weekly Calorie Tracker
                </Typography>
                <Typography variant="small" className="text-slate-500">
                  Snapshot of your intake over the last seven days
                </Typography>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-0 pb-6 pt-0 sm:px-2">
            <Chart {...chartConfig} />
          </CardBody>
        </Card>

        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <Typography variant="h5" className="text-[var(--food-primary-dark)]">
              Calorie History
            </Typography>
            <Typography variant="small" className="text-slate-500">
              Latest meals you&apos;ve logged
            </Typography>
          </div>
          {mealsLoading ? (
            <Card className="border border-orange-50 bg-white/70">
              <CardBody>
                <Typography variant="small" className="text-slate-500">
                  Loading calorie history...
                </Typography>
              </CardBody>
            </Card>
          ) : recentMeals.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recentMeals.map((meal) => (
                <CalorieHistoryCard key={meal.id} meal={meal} />
              ))}
            </div>
          ) : (
            <Card className="border border-orange-50 bg-white/70">
              <CardBody className="flex items-center justify-center">
                <Typography variant="small" className="text-slate-500">
                  {historyError || "No meal data available."}
                </Typography>
              </CardBody>
            </Card>
          )}
        </section>
      </div>

      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 sm:px-6">
        <Button
          color="orange"
          onClick={openCaptureDialog}
          aria-label="Log a meal"
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-[var(--food-primary)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-orange-300/50 transition-all duration-300 hover:bg-[var(--food-primary-dark)] hover:shadow-xl sm:w-auto sm:px-8"
        >
          <PlusIcon className="h-5 w-5" />
          Log Meal
        </Button>
      </div>

      <MealCaptureDialog
        open={isCaptureOpen}
        onClose={closeCaptureDialog}
        onConfirm={handleCaptureConfirm}
      />
    </>
  );
}
