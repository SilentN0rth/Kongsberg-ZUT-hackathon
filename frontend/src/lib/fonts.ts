import { Inter } from "next/font/google";

// Apple devices get SF Pro through the system font stack (see globals.css).
// Everything else falls back to Inter: the closest match to SF, with an optical size axis.
export const fallback = Inter({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--nf-inter",
  display: "swap",
});
