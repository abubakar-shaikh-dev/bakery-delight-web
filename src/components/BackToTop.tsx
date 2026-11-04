"use client";

import { useEffect, useState } from "react";
import { IconArrowUp } from "./icons";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed right-6 bottom-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-berry text-white shadow-lg transition-[opacity,transform,background-color] duration-200 hover:bg-berry-deep ${
        visible ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <IconArrowUp />
    </button>
  );
}
