import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
};

export function SignUp() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const trimmedEmail = form.email.trim();
    const testUser = {
      email: trimmedEmail,
      password: form.password,
    };

    localStorage.setItem("foodlog_test_user", JSON.stringify(testUser));
    localStorage.setItem("foodlog_token", "test_token");
    localStorage.setItem(
      "foodlog_user",
      JSON.stringify({ email: trimmedEmail })
    );

    navigate("/dashboard/home");
  };

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-white px-6 py-12">
      <Card className="w-full max-w-md border border-blue-gray-50 shadow-xl shadow-blue-gray-900/10">
        <div className="flex flex-col items-center gap-3 px-8 pt-10">
          <img
            src="/img/logo.png"
            alt="Food Log Logo"
            className="h-20 w-20 rounded-full border border-blue-gray-100 object-contain p-2 shadow-sm"
          />
          <Typography variant="h3" className="text-center font-semibold text-blue-gray-800">
            Create an Account
          </Typography>
          <Typography variant="small" className="text-center text-blue-gray-400">
            Join Food Log to keep tracking your meals anywhere.
          </Typography>
        </div>
        <form
          className="px-8 pb-10 pt-6"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-6">
            <div>
              <Typography variant="small" className="mb-2 block font-medium text-blue-gray-600">
                Email
              </Typography>
              <Input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                size="lg"
                placeholder="name@mail.com"
                className="!border-blue-gray-100 focus:!border-indigo-500"
                labelProps={{ className: "hidden" }}
              />
            </div>
            <div>
              <Typography variant="small" className="mb-2 block font-medium text-blue-gray-600">
                Password
              </Typography>
              <Input
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                size="lg"
                placeholder="********"
                className="!border-blue-gray-100 focus:!border-indigo-500"
                labelProps={{ className: "hidden" }}
              />
            </div>
            <div>
              <Typography variant="small" className="mb-2 block font-medium text-blue-gray-600">
                Confirm Password
              </Typography>
              <Input
                name="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                size="lg"
                placeholder="********"
                className="!border-blue-gray-100 focus:!border-indigo-500"
                labelProps={{ className: "hidden" }}
              />
            </div>
            {error && (
              <Typography variant="small" color="red" className="font-medium">
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              className="mt-2 w-full bg-indigo-500 font-semibold shadow-indigo-500/20 transition hover:shadow-lg hover:shadow-indigo-500/30"
            >
              Register Now
            </Button>
            <Typography variant="small" className="text-center text-blue-gray-400">
              Already have an account?
              <Link to="/sign-in" className="ml-1 font-medium text-indigo-500">
                Sign in
              </Link>
            </Typography>
          </div>
        </form>
      </Card>
    </section>
  );
}

export default SignUp;
