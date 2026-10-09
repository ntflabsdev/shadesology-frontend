/**
 * /dev/components — Design system showcase.
 * Only rendered in non-production environments.
 * Every component must be operable by keyboard.
 */

import { redirect } from "next/navigation";
import { ComponentShowcase } from "./ComponentShowcase";

export const metadata = {
  title: "Component Showcase — Dev",
  robots: { index: false },
};

export default function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/");
  }

  return <ComponentShowcase />;
}
