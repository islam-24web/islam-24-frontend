import type { HomeBlock } from "@/types/strapi";
import DailyTiles from "./DailyTiles";
import CategoryStrip from "./CategoryStrip";
import HomeHero from "./HomeHero";
import DivineNamesFeature from "./DivineNamesFeature";
import AppsFeature from "./AppsFeature";

interface Props {
  blocks: HomeBlock[];
}

export default function HomeBlockRenderer({ blocks }: Props) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block) => {
        switch (block.__component) {
          case "blocks.daily-tiles":
            return <DailyTiles key={block.id} block={block} />;
          case "blocks.category-strip":
            return <CategoryStrip key={block.id} block={block} />;
          case "blocks.home-hero":
            return <HomeHero key={block.id} block={block} />;
          case "blocks.divine-names-feature":
            return <DivineNamesFeature key={block.id} block={block} />;
          case "blocks.apps-feature":
            return <AppsFeature key={block.id} block={block} />;
          default: {
            const exhaustive: never = block;
            console.warn(`Unknown home block: ${(exhaustive as HomeBlock).__component}`);
            return null;
          }
        }
      })}
    </>
  );
}
