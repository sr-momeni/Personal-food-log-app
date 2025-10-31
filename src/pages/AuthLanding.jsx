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
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <Card className="w-full max-w-lg border border-blue-gray-50 shadow-xl shadow-blue-gray-900/10">
        <CardBody className="space-y-8 p-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src="/img/logo.png"
              alt="Food Log App"
              className="h-20 w-20 rounded-full border border-blue-gray-100 object-contain p-2 shadow-sm"
            />
            <Typography variant="h3" className="font-semibold text-blue-gray-800">
              Welcome to Food Log App
            </Typography>
            <Typography variant="small" className="text-blue-gray-400">
              Track your meals seamlessly across every device.
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Typography
                variant="small"
                className="text-left font-medium text-blue-gray-600"
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
                className="rounded-2xl !border-blue-gray-100 focus:!border-indigo-500"
                labelProps={{ className: "hidden" }}
              />
            </div>
            <div className="space-y-2">
              <Typography
                variant="small"
                className="text-left font-medium text-blue-gray-600"
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
                className="rounded-2xl !border-blue-gray-100 focus:!border-indigo-500"
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
              className="w-full rounded-full bg-indigo-500 py-3 text-base font-semibold shadow-indigo-500/20 transition hover:shadow-lg hover:shadow-indigo-500/30"
            >
              {loading ? "Please wait..." : "Continue"}
            </Button>
          </form>

          <div className="space-y-4">
            {Object.entries(oauthProviders).map(([key, provider]) => (
              <Button
                key={key}
                variant="outlined"
                color="blue-gray"
                className="w-full rounded-full border-blue-gray-100 py-3 text-base font-semibold"
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
