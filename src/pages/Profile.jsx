import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Typography, Avatar } from "@material-tailwind/react";
import { getProfile } from "@/api";
import { getUser } from "@/utils/auth";

const fallbackProfile = {
  name: "Salar Momeni",
  email: "momeni.salar@gmail.com",
  age: 25,
  weight: 72,
  goal: "Maintain healthy weight",
};

export default function Profile() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser?.email) {
      setProfile((prev) => ({
        ...prev,
        email: storedUser.email,
      }));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getProfile()
      .then((data) => {
        if (isMounted && data) {
          setProfile({
            name: data.name || fallbackProfile.name,
            email: data.email || fallbackProfile.email,
            age: data.age || fallbackProfile.age,
            weight: data.weight || fallbackProfile.weight,
            goal: data.goal || fallbackProfile.goal,
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err?.data?.message ||
              err?.message ||
              "Unable to load profile from the server. Showing saved details."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const userDetails = useMemo(
    () => [
      { label: "Email", value: profile.email },
      { label: "Age", value: `${profile.age}` },
      { label: "Weight", value: `${profile.weight} kg` },
      { label: "Goal", value: profile.goal },
    ],
    [profile]
  );

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center">
      <Card className="w-full max-w-3xl border border-blue-gray-100 bg-white/90 shadow-lg shadow-blue-gray-900/10">
        <CardBody className="flex flex-col gap-8 p-8 sm:p-10">
          <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:gap-8 md:text-left">
            <Avatar
              variant="circular"
              size="xl"
              className="shadow-lg shadow-indigo-500/20"
              src="/img/logo.png"
              alt={profile.name}
            />
            <div>
              <Typography variant="h4" color="blue-gray" className="font-semibold">
                {profile.name}
              </Typography>
              <Typography variant="small" className="text-blue-gray-400">
                Staying consistent with daily nutrition goals
              </Typography>
            </div>
          </div>
          {error && (
            <Typography variant="small" color="red" className="font-medium">
              {error}
            </Typography>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {userDetails.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-blue-gray-50 bg-gradient-to-br from-white to-blue-gray-50/40 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Typography variant="small" className="text-blue-gray-400 uppercase tracking-wide">
                  {item.label}
                </Typography>
                <Typography variant="h6" color="blue-gray" className="mt-1 font-medium">
                  {loading && item.label !== "Email" ? "Loading..." : item.value}
                </Typography>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
