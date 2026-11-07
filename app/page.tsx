import Hero from "@/components/sections/Hero";
import Experience from "@/components/sections/Experience";
import Work from "@/components/sections/Work";
import Toolkit from "@/components/sections/Toolkit";
import Statement from "@/components/sections/Statement";
import Origin from "@/components/sections/Origin";
import HowIWork from "@/components/sections/HowIWork";
import OffThePitch from "@/components/sections/OffThePitch";
import FullTime from "@/components/sections/FullTime";

/**
 * Order is for the person hiring: who I am, the record, the work, the stack.
 * Then how I think, where I come from, and how to reach me.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <Experience />
      <Work />
      <Toolkit />
      <Statement />
      <Origin />
      <HowIWork />
      <OffThePitch />
      <FullTime />
    </main>
  );
}
