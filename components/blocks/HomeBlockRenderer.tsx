import type { HomeBlock } from "@/types/strapi";
import DailyTiles from "./DailyTiles";

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
          default:
            console.warn(`Unknown home block: ${(block as HomeBlock).__component}`);
            return null;
        }
      })}
    </>
  );
}
