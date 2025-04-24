import React from "react";
import { Spotlight } from "./ui/Sportlight";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import MagicButton from "./ui/tailwindcss-buttons";
import { FaLocationArrow } from "react-icons/fa6";
function Hero() {
  return (
    <div className="pb-20 pt-36">
      {/*spotlight of the screen add through Spotlight from Aceternity UI*/}
      <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20
        h-screen"
          fill="white"
        />
        <Spotlight
          className="top-10 left-full h-[80vh] w-[50vw]"
          fill="purple"
        />
        <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="blue" />
      </div>
      {/*grid box add through grid and dot from Aceternity UI*/}
      <div
        className="h-screen w-full dark:bg-black-100
       bg-white  dark:bg-grid-white/[0.03] bg-grid-black/[0.2]
        absolute top-0 left-0 flex items-center justify-center"
      >
        {/* Radial gradient for the container to give a faded look */}
        <div
          className="absolute pointer-events-none 
        inset-0 flex items-center justify-center
         dark:bg-black-100 bg-white 
         [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        ></div>
      </div>
      <div className="flex justify-center relative my-20 z-10">
        <div
          className="max-w-[89vw] md:max-w-2xl 
        lg:max-w-[60vw] flex flex-col justify-center items-center 
        "
        >
          <h2
            className="uppercase tracking-widest 
            max-w-[80] text-xs text-center text-blue-100"
          >
            Dynamic Web Magic with Next.js
          </h2>
          {/*TextGenerateEffect from Aceternity UI*/}
          <TextGenerateEffect
            className="text-center md:text-[40px] 
            md:text-4xl lg:text-5xl"
            words="Transforming Concept Into Seamless User Experience"
          />
          <p
            className="text-center md:tracking-wider mb-4
             text-sm md:text-lg lg:text-2xl
          "
          >
            Hi, I&apos;m Igor, a Senior Fullstack Developer based in Brazil.
          </p>
          <a href="#about">
            <MagicButton title={"Show my work"} 
            icon={<FaLocationArrow />} 
            position={'right'}/>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Hero;
