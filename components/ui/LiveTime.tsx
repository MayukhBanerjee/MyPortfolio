"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/portfolio";

/** Local time in Bangalore, e.g. "14:32 IST". Renders a blank on the server to avoid hydration mismatch. */
export default function LiveTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: site.timezone,
    });
    const tick = () => setT(`${fmt.format(new Date())} ${site.tzLabel}`);
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t || " "}</span>;
}
