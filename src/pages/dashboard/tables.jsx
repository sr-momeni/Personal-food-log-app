import { useEffect, useMemo } from "react";
import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react";
import { useMeal } from "@/context/meal";
import { resolveBackendImage } from "@/api";

export function Tables() {
  const { meals, mealsLoading, mealsError, refreshMeals } = useMeal();

  useEffect(() => {
    if (!meals.length) {
      refreshMeals().catch(() => undefined);
    }
  }, [meals.length, refreshMeals]);

  const rows = useMemo(
    () =>
      meals.map((meal) => ({
        name: meal.name,
        calories: meal.calories,
        date: meal.date,
        image:
          resolveBackendImage(meal.image || meal.image_url || meal.filename) ||
          null,
      })),
    [meals]
  );

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card className="border border-blue-gray-50 shadow-lg shadow-blue-gray-900/5">
        <CardHeader variant="gradient" color="indigo" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Calorie History
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-4">
          <table className="w-full min-w-[720px] table-auto">
            <thead>
              <tr className="bg-blue-gray-50/50">
                {["Meal Name", "Calories", "Date", "Image"].map((header) => (
                  <th
                    key={header}
                    className="border-b border-blue-gray-100 py-3 px-6 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase tracking-wide text-blue-gray-400"
                    >
                      {header}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.name}-${row.date}-${index}`}
                  className={index % 2 === 0 ? "bg-white" : "bg-blue-gray-50/40"}
                >
                  <td className="border-b border-blue-gray-50 py-4 px-6">
                    <Typography variant="small" className="font-semibold text-blue-gray-700">
                      {row.name}
                    </Typography>
                  </td>
                  <td className="border-b border-blue-gray-50 py-4 px-6">
                    <Typography variant="small" className="font-medium text-blue-gray-600">
                      {row.calories} kcal
                    </Typography>
                  </td>
                  <td className="border-b border-blue-gray-50 py-4 px-6">
                    <Typography variant="small" className="text-blue-gray-500">
                      {row.date}
                    </Typography>
                  </td>
                  <td className="border-b border-blue-gray-50 py-4 px-6">
                    {row.image ? (
                      <img
                        src={row.image}
                        alt={row.name}
                        className="h-12 w-12 rounded-lg object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-blue-gray-100 text-[10px] uppercase text-blue-gray-200">
                        No Image
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={4} className="py-6 text-center">
                    <Typography variant="small" className="text-blue-gray-400">
                      {mealsLoading ? "Loading calorie history..." : "No meals saved yet."}
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {mealsError && (
            <div className="mt-4 px-6">
              <Typography variant="small" color="red">
                {mealsError}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Tables;
