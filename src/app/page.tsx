import { Hero } from "@/components/Hero";
import { PhotoPromise } from "@/components/PhotoPromise";
import { RegistryPage } from "@/components/RegistryPage";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <PhotoPromise />
      <RegistryPage />
      <Footer />
    </main>
  );
}
