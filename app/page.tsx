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
export default function HomePage() { return <>
 <SplashIntro/><CinematicHero/><WarmWelcome/><ExpandableServices/><RotatingFoodGallery/>
 <StoryCardStack/><CurvedEventGallery/><ServingStyles/><LivingPhotoMosaic/><ClientStories/><BookingSteps/><FinalInvitation/>
</>; }
