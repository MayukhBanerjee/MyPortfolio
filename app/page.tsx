import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Origin from "@/components/sections/Origin";
import HowIWork from "@/components/sections/HowIWork";
import Work from "@/components/sections/Work";
import Toolkit from "@/components/sections/Toolkit";
import OffThePitch from "@/components/sections/OffThePitch";
import FullTime from "@/components/sections/FullTime";

/** Ninety minutes. Scroll is the edit. */
export default function Home() {
  return (
    <main>
      <Hero />
      <Statement />
      <Origin />
      <HowIWork />
      <Work />
      <Toolkit />
      <OffThePitch />
      <FullTime />
    </main>
  );
}
