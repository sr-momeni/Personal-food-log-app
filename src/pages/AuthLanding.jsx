import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Input,
  Typography,
} from "@material-tailwind/react";
import { login } from "@/api";
import { clearSession, isAuthenticated, saveSession } from "@/utils/auth";

const INITIAL_FORM = {
  email: "",
  password: "",
};

const oauthProviders = {
  google: {
    label: "Continue with Google",
    token: "google_token_456",
    email: "user@gmail.com",
  },
  apple: {
    label: "Continue with Apple",
    token: "apple_token_789",
    email: "apple.user@icloud.com",
  },
};

export default function AuthLanding() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard/home", { replace: true });
    } else {
      clearSession();
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const email = form.email.trim();
      const response = await login({
        email,
        password: form.password,
      });

      saveSession({
        token: response.token,
        email,
        provider: "password",
      });

      navigate("/dashboard/home", { replace: true });
    } catch (error) {
      const detail =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Unable to authenticate with those credentials.";
      setMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (providerKey) => {
    setMessage("");
    const provider = oauthProviders[providerKey];
    if (!provider) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      saveSession({
        token: provider.token,
        email: provider.email,
        provider: providerKey,
      });
      navigate("/dashboard/home", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.25),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.2),transparent_40%)]" />
      <Card className="w-full max-w-lg border border-white/50 bg-white/80 shadow-2xl shadow-orange-200/40 backdrop-blur">
        <CardBody className="space-y-8 p-8 sm:p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <img
              src="/icons/food-log-icon-192.png"
              alt="Food Log App"
              className="h-24 w-24 rounded-3xl border border-orange-200 bg-white p-3 shadow-lg shadow-orange-200/50"
            />
            <div className="space-y-1">
              <Typography variant="h3" className="font-semibold text-[var(--food-primary-dark)]">
                Welcome to Food Log
              </Typography>
              <Typography variant="small" className="text-slate-500">
                Capture meals in seconds and watch your nutrition trends unfold.
              </Typography>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Typography
                variant="small"
                className="text-left font-medium text-slate-600"
              >
                Email
              </Typography>
              <Input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                size="lg"
                placeholder="email@domain.com"
                className="rounded-2xl !border-orange-100 focus:!border-[var(--food-primary)]"
                labelProps={{ className: "hidden" }}
              />
            </div>
            <div className="space-y-2">
              <Typography
                variant="small"
                className="text-left font-medium text-slate-600"
              >
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
                className="rounded-2xl !border-orange-100 focus:!border-[var(--food-primary)]"
                labelProps={{ className: "hidden" }}
              />
            </div>
            {message && (
              <Typography variant="small" color="red" className="font-medium">
                {message}
              </Typography>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--food-primary)] py-3 text-base font-semibold shadow-lg shadow-orange-300/40 transition hover:bg-[var(--food-primary-dark)]"
            >
              {loading ? "Please wait..." : "Continue"}
            </Button>
          </form>

          <div className="space-y-4">
            {Object.entries(oauthProviders).map(([key, provider]) => (
              <Button
                key={key}
                variant="outlined"
                color="orange"
                className="w-full rounded-full border-orange-200 py-3 text-base font-semibold text-[var(--food-primary-dark)] hover:bg-orange-50"
                onClick={() => handleOAuth(key)}
                disabled={loading}
              >
                {provider.label}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
