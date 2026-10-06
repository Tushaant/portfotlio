import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { JourneySection } from "@/components/sections/JourneySection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CaseStudiesSection } from "@/components/sections/CaseStudiesSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { OwnershipSection } from "@/components/sections/OwnershipSection";
import { ArchitectureSection } from "@/components/sections/ArchitectureSection";
import { DecisionsSection } from "@/components/sections/DecisionsSection";
import { LearningSection } from "@/components/sections/LearningSection";
import { BriefSection } from "@/components/sections/BriefSection";
import { ViewSwitcher } from "@/components/ui/ViewSwitcher";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ViewSwitcher />
      <ImpactSection />
      <OwnershipSection />
      <ArchitectureSection />
      <JourneySection />
      <CaseStudiesSection />
      <DecisionsSection />
      <ProjectsSection />
      <SkillsSection />
      <TechStackSection />
      <LearningSection />
      <TestimonialsSection />
      <AchievementsSection />
      <AboutSection />
      <GallerySection />
      <BriefSection />
      <ContactSection />
      <SiteFooter />
    </>
  );
}
