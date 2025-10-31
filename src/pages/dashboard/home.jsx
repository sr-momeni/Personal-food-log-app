import React from "react";

const meals = [
  { name: "Breakfast", calories: 400 },
  { name: "Lunch", calories: 750 },
  { name: "Dinner", calories: 850 },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <header className="flex items-center justify-between px-6 py-5 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Personal Food Log App
        </h1>
        <img
          src="https://i.pravatar.cc/80?img=12"
          alt="Profile"
          className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500/50"
        />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900">Today’s Meals</h2>
          <p className="mt-1 text-sm text-gray-500">
            Quick snapshot of your daily intake.
          </p>

          <ul className="mt-6 divide-y divide-gray-100">
            {meals.map((meal) => (
              <li
                key={meal.name}
                className="flex items-center justify-between py-4"
              >
                <span className="text-base font-medium text-gray-800">
                  {meal.name}
                </span>
                <span className="text-sm font-semibold text-indigo-600">
                  {meal.calories} kcal
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex justify-center">
          <button className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/40 rounded-full shadow-md transition">
            Log Meal
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
