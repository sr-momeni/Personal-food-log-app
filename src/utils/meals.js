const DEFAULT_WEEKLY_CALORIES = [2100, 1950, 2230, 2010, 1890, 2400, 2150];

const DAY_INDEX = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  0: 6,
};

export const parseMealDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const DEFAULT_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export const formatMealDate = (value, formatter = DEFAULT_DATE_FORMATTER) => {
  const date = parseMealDate(value);
  if (!date) return "Unknown date";
  return formatter.format(date);
};

export const computeWeeklySeries = (meals, referenceDate = new Date()) => {
  if (!Array.isArray(meals) || !meals.length) {
    return DEFAULT_WEEKLY_CALORIES;
  }

  const totals = Array(7).fill(0);
  let hasValues = false;

  const today = new Date(referenceDate);
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

    const index = DAY_INDEX[normalizedDate.getDay()];
    if (typeof index !== "number") return;

    totals[index] += caloriesValue;
    hasValues = hasValues || caloriesValue > 0;
  });

  return hasValues ? totals : DEFAULT_WEEKLY_CALORIES;
};

export const getDefaultWeeklyCalories = () => [...DEFAULT_WEEKLY_CALORIES];

export default {
  parseMealDate,
  formatMealDate,
  computeWeeklySeries,
  getDefaultWeeklyCalories,
};
