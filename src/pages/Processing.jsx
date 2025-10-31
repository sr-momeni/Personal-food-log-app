import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { useMeal } from "@/context/meal";
import { predictMeal, uploadMeal } from "@/api";

export default function Processing() {
  const { capture, setAnalysis, setCapture } = useMeal();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let redirectTimeout;

    if (!capture?.file) {
      navigate("/dashboard/home", { replace: true });
      return () => undefined;
    }

    const processMeal = async () => {
      try {
        const uploadResult = await uploadMeal(capture.file);
        const storedFilename =
          uploadResult?.path ||
          uploadResult?.image_url ||
          uploadResult?.image ||
          uploadResult?.filename ||
          uploadResult?.file ||
          null;
        if (!storedFilename) {
          throw new Error("Upload failed. No filename returned from server.");
        }

        const prediction = await predictMeal(capture.file);
        const normalizedAnalysis = {
          meal: prediction?.meal || prediction?.food || "Logged Meal",
          ingredients: prediction?.ingredients || [],
          calories: prediction?.calories,
          image: storedFilename || prediction?.image || prediction?.image_url,
          raw: prediction,
          previewUrl: capture.previewUrl,
        };

        setAnalysis(normalizedAnalysis);
        redirectTimeout = setTimeout(() => navigate("/result", { replace: true }), 3000);
      } catch (err) {
        setError(
          err.message || "We could not analyze this meal. Please try again."
        );
        setCapture(null);
        setAnalysis(null);
        redirectTimeout = setTimeout(
          () => navigate("/dashboard/home", { replace: true }),
          2500
        );
      }
    };

    processMeal();

    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [capture, navigate, setAnalysis, setCapture]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-white">
      <Card className="w-full max-w-md border border-blue-gray-50 bg-white shadow-lg shadow-blue-gray-900/10">
        <CardBody className="flex flex-col items-center gap-6 p-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-indigo-100 bg-indigo-50">
            <span className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
          <div className="space-y-2">
            <Typography variant="h4" color="blue-gray">
              Processing...
            </Typography>
            <Typography variant="small" className="text-blue-gray-400">
              Analyzing your meal...
            </Typography>
          </div>
          {error && (
            <Typography variant="small" color="red">
              {error}
            </Typography>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
