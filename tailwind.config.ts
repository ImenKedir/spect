import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        muddy: "#151818",
        bullet: "#212325",
        jolly: "#033933",
        plush: "#3A1A30",
        office: "#FAFAFA",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: "class",
} satisfies Config;
