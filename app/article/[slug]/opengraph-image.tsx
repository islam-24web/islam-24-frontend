import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/api";

export const alt = "إسلام 24";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap";

let arabicFontsPromise:
  | Promise<
      Array<{
        name: string;
        data: ArrayBuffer;
        weight: 400 | 700;
        style: "normal";
      }>
    >
  | null = null;

function truncate(text: string, max: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1)}…`;
}

function pickFontUrl(css: string, weight: 400 | 700): string | null {
  const blocks = css.match(/@font-face\s*{[^}]+}/g) ?? [];
  const weightBlocks = blocks.filter((block) =>
    block.includes(`font-weight: ${weight}`),
  );
  const arabicBlock =
    weightBlocks.find((block) => /unicode-range:[^;}]*0600/i.test(block)) ??
    weightBlocks[0] ??
    blocks[0];
  const match = arabicBlock?.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  return match?.[1] ?? null;
}

async function loadArabicFonts() {
  if (!arabicFontsPromise) {
    arabicFontsPromise = (async () => {
      try {
        const css = await fetch(FONT_CSS_URL, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; Islam24OG/1.0; +https://islam-24.com)",
          },
          next: { revalidate: 60 * 60 * 24 * 30 },
        }).then((res) => (res.ok ? res.text() : ""));

        const fonts = await Promise.all(
          ([400, 700] as const).map(async (weight) => {
            const url = pickFontUrl(css, weight);
            if (!url) return null;
            const data = await fetch(url, {
              next: { revalidate: 60 * 60 * 24 * 30 },
            }).then((res) => (res.ok ? res.arrayBuffer() : null));
            return data
              ? {
                  name: "Tajawal",
                  data,
                  weight,
                  style: "normal" as const,
                }
              : null;
          }),
        );

        return fonts.filter((font): font is NonNullable<typeof font> => Boolean(font));
      } catch (error) {
        console.warn("[OG] Failed to load Arabic font:", error);
        return [];
      }
    })();
  }
  return arabicFontsPromise;
}

interface Props {
  params: { slug: string };
}

export default async function Image({ params }: Props) {
  const [article, fonts] = await Promise.all([
    getArticleBySlug(params.slug),
    loadArabicFonts(),
  ]);

  const title = truncate(article?.title ?? "إسلام 24", 92);
  const category = truncate(article?.category?.name ?? "مقال", 34);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #062f2a 0%, #0f513f 48%, #f7f0dd 49%, #f8faf7 100%)",
          fontFamily: "Tajawal",
          direction: "rtl",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.16,
            backgroundImage:
              "radial-gradient(circle at 18px 18px, #f6d365 2px, transparent 2px)",
            backgroundSize: "54px 54px",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -140,
            top: -120,
            width: 420,
            height: 420,
            borderRadius: 420,
            border: "44px solid rgba(246, 211, 101, 0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 70,
            bottom: 56,
            width: 220,
            height: 220,
            borderRadius: 220,
            border: "30px solid rgba(6, 47, 42, 0.08)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 76px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#f8faf7",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                direction: "ltr",
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 70,
                  background: "#d99a23",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 700,
                }}
              >
                24
              </div>
              <div style={{ display: "flex", flexDirection: "column", direction: "rtl" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                    direction: "ltr",
                    fontSize: 34,
                    fontWeight: 700,
                  }}
                >
                  <span>24</span>
                  <span>إسلام</span>
                </div>
                <div style={{ fontSize: 18, color: "#bfe4d5", marginTop: 2 }}>
                  معرفة موثوقة وسياق واضح
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                border: "1px solid rgba(246, 211, 101, 0.55)",
                color: "#f8e7aa",
                borderRadius: 999,
                padding: "10px 22px",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {category}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 810,
              alignSelf: "flex-start",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 96,
                height: 6,
                borderRadius: 6,
                background: "#d99a23",
                marginBottom: 28,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                fontSize: 58,
                lineHeight: 1.32,
                fontWeight: 700,
                letterSpacing: 0,
                textAlign: "right",
                textWrap: "balance",
              }}
            >
              {title === "إسلام 24" ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 34,
                    direction: "ltr",
                  }}
                >
                  <div style={{ display: "flex" }}>24</div>
                  <div style={{ display: "flex" }}>إسلام</div>
                </div>
              ) : (
                title
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#12352d",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#f8e7aa",
                fontSize: 20,
                fontWeight: 400,
              }}
            >
              islam-24.com
            </div>
            <div
              style={{
                display: "flex",
                color: "#0f513f",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              اقرأ المقال كاملاً على إسلام 24
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    },
  );
}
