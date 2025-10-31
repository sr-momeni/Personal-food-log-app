import { Typography } from "@material-tailwind/react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-3">
      <div className="w-full px-2">
        <Typography
          variant="small"
          className="text-center text-sm font-normal text-gray-500"
        >
          &copy; {year}, Team Company DANISA — All Rights Reserved.
        </Typography>
      </div>
    </footer>
  );
}

Footer.displayName = "/src/widgets/layout/footer.jsx";

export default Footer;
