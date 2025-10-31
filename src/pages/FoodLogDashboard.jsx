import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
} from "@material-tailwind/react";
import {
  PlusIcon,
  CameraIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMeal } from "@/context/meal";
import { useMaterialTailwindController } from "@/context";
import { CalorieHistoryCard } from "@/widgets/cards";
import { resolveBackendImage } from "@/api";

const DEFAULT_WEEKLY_CALORIES = [2100, 1950, 2230, 2010, 1890, 2400, 2150];

const colorPalette = {
  dark: { primary: "#0f172a", secondary: "#334155" },
  white: { primary: "#4f46e5", secondary: "#818cf8" },
  green: { primary: "#0f9d58", secondary: "#34d399" },
  blue: { primary: "#3b82f6", secondary: "#2563eb" },
  red: { primary: "#ef4444", secondary: "#f87171" },
  pink: { primary: "#ec4899", secondary: "#f472b6" },
  default: { primary: "#4f46e5", secondary: "#818cf8" },
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const DAY_INDEX = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  0: 6,
};

const parseMealDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatMealDate = (value) => {
  const date = parseMealDate(value);
  if (!date) return "Unknown date";
  return date.toLocaleDateString();
};

const computeWeeklySeries = (meals) => {
  if (!Array.isArray(meals) || !meals.length) {
    return DEFAULT_WEEKLY_CALORIES;
  }

  const totals = Array(7).fill(0);
  let hasValues = false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  meals.forEach((meal) => {
    const caloriesValue = Number(meal.calories);
    if (!Number.isFinite(caloriesValue)) return;

    const dateValue = meal.date || meal.created_at;
    const date = parseMealDate(dateValue);
    if (!date) return;

    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    const diffInDays = Math.floor(
      (today.getTime() - normalizedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffInDays < 0 || diffInDays > 6) return;

    const index = DAY_INDEX[date.getDay()];
    if (typeof index !== "number") return;

    totals[index] += caloriesValue;
    hasValues = hasValues || caloriesValue > 0;
  });

  return hasValues ? totals : DEFAULT_WEEKLY_CALORIES;
};

export default function FoodLogDashboard() {
  const { setCapture, setAnalysis, meals, mealsLoading, mealsError } = useMeal();
  const [controller] = useMaterialTailwindController();
  const { sidenavColor } = controller;
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Camera not available. Please use the 'Upload Photo' option instead."
      );
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraError("");
      setPreviewSrc(null);
      setIsCameraActive(true);
    } catch (error) {
      setCameraError(
        "Unable to access the camera. Please allow permissions or upload a photo."
      );
      setIsCameraActive(false);
    }
  };

  const handleOpenModal = async () => {
    setPreviewSrc(null);
    setIsModalOpen(true);
    await startCamera();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCameraError("");
    setPreviewSrc(null);
    stopCamera();
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const preview = canvas.toDataURL("image/png", 0.92);
    setPreviewSrc(preview);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `meal_${Date.now()}.png`, {
          type: "image/png",
        });
        setCapture({ file, previewUrl: preview });
        setAnalysis(null);
        handleCloseModal();
        navigate("/processing");
      },
      "image/png",
      0.92
    );
  };

  const handleUploadClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = await readFileAsDataUrl(file);
    setPreviewSrc(preview);
    setCapture({ file, previewUrl: preview });
    setAnalysis(null);
    handleCloseModal();
    navigate("/processing");
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="space-y-8 pb-24">
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none px-6 py-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h5" color="blue-gray">
                Weekly Calorie Tracker
              </Typography>
              <Typography variant="small" className="text-blue-gray-400">
                Snapshot of your daily intake over the last seven days
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-2 pb-6 pt-0">
          <Chart {...chartConfig} />
        </CardBody>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <Typography variant="h5" color="blue-gray">
            Calorie History
          </Typography>
          <Typography variant="small" className="text-blue-gray-400">
            Latest meals you&apos;ve logged
          </Typography>
        </div>
        {mealsLoading ? (
          <Card className="border border-blue-gray-50">
            <CardBody>
              <Typography variant="small" className="text-blue-gray-400">
                Loading calorie history...
              </Typography>
            </CardBody>
          </Card>
        ) : recentMeals.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {recentMeals.map((meal) => (
              <CalorieHistoryCard key={meal.id} meal={meal} />
            ))}
          </div>
        ) : (
          <Card className="border border-blue-gray-50">
            <CardBody className="flex items-center justify-center">
              <Typography variant="small" className="text-blue-gray-400">
                {historyError || "No meal data available."}
              </Typography>
            </CardBody>
          </Card>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-8 z-40 flex justify-center">
        <Button
          color="blue-gray"
          onClick={handleOpenModal}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-black px-8 py-3 font-semibold text-white shadow-lg shadow-gray-900/30 transition-all duration-300 hover:bg-black/90 hover:shadow-xl pulse-scale"
        >
          <PlusIcon className="h-5 w-5 text-white" />
          + Log Meal 🍽️
        </Button>
      </div>

      <Dialog
        open={isModalOpen}
        handler={handleCloseModal}
        size="xs"
        dismiss={{ enabled: true }}
        className="mx-4 mb-4 rounded-3xl bg-white p-0 shadow-xl sm:mx-auto sm:w-[420px]"
        containerProps={{
          className:
            "fixed inset-0 z-[999] grid items-end justify-center bg-black/40 px-4 pb-6",
        }}
      >
        <DialogHeader className="flex items-center justify-between px-5 py-4">
          <div>
            <Typography variant="h5">Add Meal Photo</Typography>
            <Typography variant="small" className="text-blue-gray-400">
              Capture a quick snapshot or upload from your gallery
            </Typography>
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={handleCloseModal}
            className="rounded-full"
          >
            <XMarkIcon className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="space-y-4 px-5 pb-4">
          <div className="rounded-2xl border border-blue-gray-100 bg-blue-gray-50/60 p-3">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="Meal preview"
                className="h-48 w-full rounded-xl object-cover"
              />
            ) : isCameraActive ? (
              <video
                ref={videoRef}
                className="h-48 w-full rounded-xl object-cover"
                playsInline
                autoPlay
                muted
              />
            ) : (
              <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl bg-white text-blue-gray-300">
                <CameraIcon className="mb-2 h-12 w-12" />
                <Typography variant="small" className="text-blue-gray-300">
                  Camera preview will appear here
                </Typography>
              </div>
            )}
          </div>

          {cameraError && (
            <Typography variant="small" color="red" className="font-medium">
              {cameraError}
            </Typography>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              color="indigo"
              className="flex flex-1 items-center justify-center gap-2"
              onClick={isCameraActive ? handleCapture : startCamera}
            >
              <CameraIcon className="h-5 w-5" />
              {isCameraActive ? "Capture Photo" : "Try Camera Again"}
            </Button>
            <Button
              variant="outlined"
              color="indigo"
              className="flex flex-1 items-center justify-center gap-2"
              onClick={handleUploadClick}
            >
              <PhotoIcon className="h-5 w-5" />
              Upload Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </DialogBody>
        <DialogFooter className="flex items-center justify-between gap-2 px-5 pb-5 pt-0">
          <Typography variant="small" className="text-blue-gray-400">
            Preview is saved temporarily until you submit.
          </Typography>
          <Button
            color="blue-gray"
            variant="text"
            className="px-6"
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
        </DialogFooter>
        <canvas ref={canvasRef} className="hidden" />
      </Dialog>
    </div>
  );
}

