import { FloatingNav } from "@/components/ui/floating-navbar";
import Hero from "@/components/Hero";
import { FaHome } from "react-icons/fa";
import Grid from "@/components/Grid";

export default function Home() {
  return (
    <main
      className="relative 
       bg-black-100
    flex justify-center  
    flex-col items-center overflow-hidden mx-auto
    sm:p-10 px-5
    "
    >
      <div className="max-w-7xl w-full">
        <FloatingNav
          navItems={[{ name: "Home", link: "/", icon: <FaHome /> }]}
        />
        <Hero />
        <Grid />
      </div>
    </main>
  );
}
