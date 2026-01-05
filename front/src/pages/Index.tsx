import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ModuleTabs } from "@/components/ModuleTabs";
import { ImageModule } from "@/components/ImageModule";
import { VideoModule } from "@/components/VideoModule";

const Index = () => {
  const [activeModule, setActiveModule] = useState<"image" | "video">("image");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero background gradient */}
      <div className="fixed inset-0 -z-10 bg-hero-glow" />

      <Header />

      <main className="container py-8 space-y-8">
        <HeroSection />

        <ModuleTabs
          activeModule={activeModule}
          onModuleChange={setActiveModule}
        />

        <div className="animate-fade-in">
          {activeModule === "image" ? <ImageModule /> : <VideoModule />}
        </div>
      </main>

      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            TrueShot — Cryptographic Media Verification Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
