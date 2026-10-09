import { SplashIntro } from "@/components/home/SplashIntro";
import { CinematicHero } from "@/components/home/CinematicHero";
import { WarmWelcome } from "@/components/home/WarmWelcome";
import { ExpandableServices } from "@/components/home/ExpandableServices";
import { RotatingFoodGallery } from "@/components/home/RotatingFoodGallery";
import { StoryCardStack } from "@/components/home/StoryCardStack";
import { CurvedEventGallery } from "@/components/home/CurvedEventGallery";
import { ServingStyles } from "@/components/home/ServingStyles";
import { LivingPhotoMosaic } from "@/components/home/LivingPhotoMosaic";
import { ClientStories } from "@/components/home/ClientStories";
import { BookingSteps } from "@/components/home/BookingSteps";
import { FinalInvitation } from "@/components/home/FinalInvitation";
import {HomeWave} from "@/components/home/HomeWave";
import {getIntroFrames} from "@/lib/public-dynamic";
export const dynamic="force-dynamic";
export default async function HomePage() { const frames=await getIntroFrames(); return <>
 <SplashIntro frames={frames}/>
 <div className="home-editorial">
  <CinematicHero/><HomeWave/><WarmWelcome/><HomeWave variant="warm"/>
  <ExpandableServices/><HomeWave/><RotatingFoodGallery/><HomeWave variant="warm"/>
  <StoryCardStack/><HomeWave/><CurvedEventGallery/><HomeWave variant="warm"/>
  <ServingStyles/><HomeWave/><LivingPhotoMosaic/><HomeWave variant="warm"/>
  <ClientStories/><HomeWave/><BookingSteps/><HomeWave variant="warm"/><FinalInvitation/>
 </div>
</>; }
