import { Header } from "@/components/Header";
import { BillboardMarquee } from "@/components/BillboardMarquee";
import { Hero } from "@/components/Hero";
import { ToolGrid } from "@/components/ToolGrid";
import { Platforms } from "@/components/Platforms";
import { Support } from "@/components/Support";
import { Footer } from "@/components/Footer";
import { readTools } from "@/lib/tools";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const tools = await readTools();

  return (
    <>
      <Header />
      <main className="pt-[7.5rem]">
        <Hero />
        <BillboardMarquee />
        <ToolGrid tools={tools} />
        <Platforms />
        <Support />
      </main>
      <BillboardMarquee />
      <Footer />
    </>
  );
}
