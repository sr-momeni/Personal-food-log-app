import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import { useMeal } from "@/context/meal";
import { resolveBackendImage, saveMeal } from "@/api";

export default function Result() {
  const { capture, analysis, setCapture, setAnalysis, refreshMeals } = useMeal();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!analysis) {
      navigate("/dashboard/home", { replace: true });
    }
  }, [analysis, navigate]);

  const imageSrc = useMemo(() => {
    if (analysis?.previewUrl) return analysis.previewUrl;
    if (capture?.previewUrl) return capture.previewUrl;
    const backendImage = analysis?.image || analysis?.image_url;
    if (backendImage) return resolveBackendImage(backendImage);
    return "/img/home-decor-1.jpeg";
  }, [analysis, capture]);

  const ingredients = analysis?.ingredients || [];
  const calories = analysis?.calories;
  const mealName = analysis?.meal || "Logged Meal";

  const resetFlow = () => {
    setCapture(null);
    setAnalysis(null);
  };

  const handleCancel = () => {
    resetFlow();
    navigate("/dashboard/home", { replace: true });
  };

  const handleSave = async () => {
    if (!analysis) return;
    setError("");
    setSaving(true);

    try {
      const numericCalories =
        typeof calories === "number" ? calories : Number(calories);
      const caloriesValue = Number.isFinite(numericCalories)
        ? Math.round(numericCalories)
        : 0;

      await saveMeal({
        name: mealName,
        calories: caloriesValue,
        image: analysis.image || analysis.image_url,
      });
      await refreshMeals().catch(() => undefined);
      resetFlow();
      navigate("/dashboard/home", { replace: true });
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.data?.error ||
          err?.message ||
          "Unable to save this meal right now. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <Card className="w-full max-w-3xl border border-orange-100/60 bg-white/90 shadow-2xl shadow-orange-200/50 backdrop-blur">
        <CardBody className="flex flex-col gap-8 p-8 sm:p-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Typography variant="h4" className="text-[var(--food-primary-dark)]">
                {mealName}
              </Typography>
              <div className="overflow-hidden rounded-3xl border border-orange-100/60 bg-orange-50/60 shadow-inner">
                <img
                  src={imageSrc}
                  alt={mealName}
                  className="h-64 w-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="small" className="font-semibold uppercase text-slate-500">
                  Ingredients
                </Typography>
                <ul className="mt-2 space-y-2">
                  {ingredients.map((ingredient) => (
                    <li
                      key={ingredient}
                      className="rounded-xl border border-orange-50 bg-orange-50/60 px-4 py-2 text-sm font-medium text-[var(--food-primary-dark)]"
                    >
                      {ingredient}
                    </li>
                  ))}
                  {!ingredients.length && (
                    <li className="rounded-xl border border-dashed border-orange-200 px-4 py-3 text-sm text-orange-300">
                      Ingredients will appear here after analysis.
                    </li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-teal-50 px-5 py-4 text-[var(--food-primary)] shadow-inner">
                <Typography variant="small" className="uppercase tracking-wide text-[var(--food-primary-dark)]">
                  Estimated Nutrition
                </Typography>
                <Typography variant="h5" className="mt-2 font-semibold text-[var(--food-primary-dark)]">
                  {calories ? `${calories} Cal` : "Calculating..."}
                </Typography>
              </div>
            </div>
          </div>
          {error && (
            <Typography variant="small" color="red" className="font-medium">
              {error}
            </Typography>
          )}
        </CardBody>
        <CardFooter className="flex flex-col gap-3 border-t border-orange-100/60 bg-orange-50/60 px-8 py-6 sm:flex-row sm:justify-end">
          <Button
            variant="outlined"
            color="orange"
            onClick={handleCancel}
            className="w-full border-orange-200 text-[var(--food-primary-dark)] hover:bg-orange-50 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            color="orange"
            onClick={handleSave}
            disabled={saving}
            className="w-full font-semibold shadow-lg shadow-orange-300/40 sm:w-auto"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
