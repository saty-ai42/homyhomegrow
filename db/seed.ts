import { getDb } from "../api/queries/connection";
import { sql } from "drizzle-orm";
import {
  categories,
  blogPosts,
  guides,
  guideSteps,
  growDiaries,
  growDiaryEntries,
  media,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Clearing and seeding database...");

  // Clear existing data in correct order
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await db.execute(sql`TRUNCATE TABLE growDiaryEntries`);
  await db.execute(sql`TRUNCATE TABLE growDiaries`);
  await db.execute(sql`TRUNCATE TABLE guideSteps`);
  await db.execute(sql`TRUNCATE TABLE guides`);
  await db.execute(sql`TRUNCATE TABLE blogPosts`);
  await db.execute(sql`TRUNCATE TABLE categories`);
  await db.execute(sql`TRUNCATE TABLE media`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

  // Categories
  await db.insert(categories).values([
    { slug: "anbau", nameDe: "Anbau", nameEn: "Cultivation" },
    { slug: "equipment", nameDe: "Equipment", nameEn: "Equipment" },
    { slug: "strains", nameDe: "Strains", nameEn: "Strains" },
    { slug: "troubleshooting", nameDe: "Problemlösung", nameEn: "Troubleshooting" },
  ]);
  console.log("Categories seeded");

  // Blog Posts
  await db.insert(blogPosts).values([
    {
      slug: "erster-grow-guide",
      titleDe: "Dein Erster Grow: Der Komplette Guide",
      titleEn: "Your First Grow: The Complete Guide",
      excerptDe: "Alles was du für deinen ersten Cannabis-Anbau brauchst.",
      excerptEn: "Everything you need for your first cannabis grow.",
      contentDe: "## Willkommen beim Cannabis-Anbau\n\nDieser Guide deckt alles ab von der Keimung bis zur Ernte.\n\n### Die Basics\n\nBevor du startest, brauchst du das richtige Equipment:\n- Growbox oder Growzelt\n- LED Growlampe\n- Belüftungssystem\n- Töpfe und Erde\n\n### Keimung\n\nDie Keimung ist der erste und wichtigste Schritt.\n\n![Cannabis Sämling](/images/seedling.jpg)",
      contentEn: "## Welcome to Cannabis Growing\n\nThis guide covers everything from germination to harvest.\n\n### The Basics\n\nBefore you start, you need the right equipment:\n- Grow box or tent\n- LED grow light\n- Ventilation system\n- Pots and soil\n\n### Germination\n\nGermination is the first and most important step.\n\n![Cannabis Seedling](/images/seedling.jpg)",
      featuredImage: "/images/seedling.jpg",
      categoryId: 1,
      status: "published",
      readTimeMinutes: 10,
      publishedAt: new Date(),
    },
    {
      slug: "beste-led-lampen",
      titleDe: "Die Besten LED Grow-Lampen 2025",
      titleEn: "The Best LED Grow Lights 2025",
      excerptDe: "Vergleich der Top LED-Lampen für den Indoor-Anbau.",
      excerptEn: "Comparison of the top LED lights for indoor growing.",
      contentDe: "## LED Lampen Vergleich\n\nWir haben die besten LED Grow-Lampen getestet.\n\n### Unsere Top-Empfehlungen\n\n1. **Spider Farmer SF1000** - Beste Preis-Leistung\n2. **Mars Hydro TS1000** - Ideal für Anfänger\n3. **Horticulture Lighting Group** - Premium Option\n\n![LED Lampe](/images/grow-setup.jpg)",
      contentEn: "## LED Lights Comparison\n\nWe tested the best LED grow lights.\n\n### Our Top Picks\n\n1. **Spider Farmer SF1000** - Best value\n2. **Mars Hydro TS1000** - Great for beginners\n3. **Horticulture Lighting Group** - Premium option\n\n![LED Light](/images/grow-setup.jpg)",
      featuredImage: "/images/grow-setup.jpg",
      categoryId: 2,
      status: "published",
      readTimeMinutes: 8,
      publishedAt: new Date(Date.now() - 86400000),
    },
    {
      slug: "top-5-autoflowering",
      titleDe: "Top 5 Autoflowering Sorten",
      titleEn: "Top 5 Autoflowering Strains",
      excerptDe: "Die besten Autoflowering Sorten für schnelle Ernten.",
      excerptEn: "The best autoflowering strains for quick harvests.",
      contentDe: "## Autoflowering Sorten\n\nAutoflowering Sorten sind perfekt für Anfänger.\n\n### Unsere Favoriten\n\n- **Northern Lights Auto** - Robust und ertragreich\n- **White Widow Auto** - Klassiker\n- **Amnesia Haze Auto** - Sativa-Energie\n\n![Cannabis Plant](/images/buds.jpg)",
      contentEn: "## Autoflowering Strains\n\nAutoflowering strains are perfect for beginners.\n\n### Our Favorites\n\n- **Northern Lights Auto** - Robust and high-yielding\n- **White Widow Auto** - Classic\n- **Amnesia Haze Auto** - Sativa energy\n\n![Cannabis Plant](/images/buds.jpg)",
      featuredImage: "/images/buds.jpg",
      categoryId: 3,
      status: "published",
      readTimeMinutes: 6,
      publishedAt: new Date(Date.now() - 172800000),
    },
  ]);
  console.log("Blog posts seeded");

  // Guides
  await db.insert(guides).values([
    {
      slug: "keimung-anleitung",
      titleDe: "Cannabis Keimung: Schritt-für-Schritt",
      titleEn: "Cannabis Germination: Step-by-Step",
      descriptionDe: "Lerne wie du Cannabis-Samen richtig keimst.",
      descriptionEn: "Learn how to properly germinate cannabis seeds.",
      contentDe: "## Einführung\n\nDie Keimung ist der wichtigste Schritt im gesamten Anbauprozess.\n\n### Was du brauchst\n\n- Cannabis-Samen\n- Papierhandtücher\n- Zwei Teller\n- Destilliertes Wasser\n\n![Keimung Setup](/images/seedling.jpg)",
      contentEn: "## Introduction\n\nGermination is the most important step in the entire growing process.\n\n### What you need\n\n- Cannabis seeds\n- Paper towels\n- Two plates\n- Distilled water\n\n![Germination Setup](/images/seedling.jpg)",
      difficulty: "beginner",
      estimatedTimeMinutes: 15,
      status: "published",
      publishedAt: new Date(),
    },
    {
      slug: "topfen-uebertragung",
      titleDe: "Topf-Übertragung: Wann & Wie",
      titleEn: "Pot Transplanting: When & How",
      descriptionDe: "Wann und wie du deine Pflanzen in größere Töpfe umtopfst.",
      descriptionEn: "When and how to transplant your plants into larger pots.",
      contentDe: "## Wann umtopfen?\n\nDie richtige Zeit für die Übertragung ist entscheidend.\n\n### Anzeichen\n\n- Wurzeln wachsen aus den Drainagelöchern\n- Pflanze wächst langsamer\n- Erde trocknet zu schnell aus\n\n![Topf Übertagung](/images/plant.jpg)",
      contentEn: "## When to transplant?\n\nThe right timing for transplanting is crucial.\n\n### Signs\n\n- Roots growing out of drainage holes\n- Plant growth slows down\n- Soil dries out too quickly\n\n![Pot Transplanting](/images/plant.jpg)",
      difficulty: "intermediate",
      estimatedTimeMinutes: 20,
      status: "published",
      publishedAt: new Date(Date.now() - 86400000),
    },
  ]);
  console.log("Guides seeded");

  // Guide Steps
  await db.insert(guideSteps).values([
    { guideId: 1, stepNumber: 1, titleDe: "Vorbereitung", titleEn: "Preparation", contentDe: "Lege alle Materialien bereit.", contentEn: "Gather all materials." },
    { guideId: 1, stepNumber: 2, titleDe: "Samen einweichen", titleEn: "Soak seeds", contentDe: "Lege die Samen 12-24h in Wasser.", contentEn: "Place seeds in water for 12-24h." },
    { guideId: 1, stepNumber: 3, titleDe: "Papierhandtuch-Methode", titleEn: "Paper towel method", contentDe: "Lege die Samen zwischen feuchte Papierhandtücher.", contentEn: "Place seeds between damp paper towels." },
    { guideId: 2, stepNumber: 1, titleDe: "Neuen Topf vorbereiten", titleEn: "Prepare new pot", contentDe: "Fülle den neuen Topf mit frischer Erde.", contentEn: "Fill the new pot with fresh soil." },
    { guideId: 2, stepNumber: 2, titleDe: "Pflanze herausnehmen", titleEn: "Remove plant", contentDe: "Nimm die Pflanze vorsichtig aus dem alten Topf.", contentEn: "Carefully remove the plant from the old pot." },
  ]);
  console.log("Guide steps seeded");

  // Grow Diaries
  await db.insert(growDiaries).values([
    {
      slug: "white-widow-grow",
      strainNameDe: "White Widow",
      strainNameEn: "White Widow",
      breeder: "Royal Queen Seeds",
      seedType: "feminized",
      growMethod: "soil",
      status: "flowering",
      startDate: new Date(Date.now() - 50 * 86400000),
      dayCount: 50,
      descriptionDe: "Mein erster Grow mit White Widow. Indoor im 60x60cm Zelt.",
      descriptionEn: "My first grow with White Widow. Indoor in a 60x60cm tent.",
      featuredImage: "/images/buds.jpg",
      isPublic: "public",
    },
    {
      slug: "northern-lights-auto",
      strainNameDe: "Northern Lights Auto",
      strainNameEn: "Northern Lights Auto",
      breeder: "Seedsman",
      seedType: "autoflowering",
      growMethod: "coco",
      status: "harvesting",
      startDate: new Date(Date.now() - 80 * 86400000),
      dayCount: 80,
      descriptionDe: "Northern Lights Auto in Coco. Schneller und ertragreicher Grow.",
      descriptionEn: "Northern Lights Auto in coco. Quick and high-yielding grow.",
      featuredImage: "/images/seedling.jpg",
      isPublic: "public",
    },
  ]);
  console.log("Grow diaries seeded");

  // Grow Diary Entries
  await db.insert(growDiaryEntries).values([
    { diaryId: 1, day: 1, week: 1, titleDe: "Keimung gestartet", titleEn: "Germination started", contentDe: "Samen in Wasser gelegt. Warten auf den Taproot.", contentEn: "Seeds placed in water. Waiting for taproot.", humidity: 70, temperature: 24 },
    { diaryId: 1, day: 3, week: 1, titleDe: "Taproot sichtbar", titleEn: "Taproot visible", contentDe: "Die Samen haben gekeimt! Bereit für die Erde.", contentEn: "Seeds have germinated! Ready for soil.", humidity: 65, temperature: 23 },
    { diaryId: 1, day: 14, week: 2, titleDe: "Erste Blätter", titleEn: "First leaves", contentDe: "Die ersten echten Blätter sind zu sehen. Wachstum läuft gut.", contentEn: "First true leaves visible. Growth is going well.", humidity: 60, temperature: 25 },
    { diaryId: 1, day: 30, week: 4, titleDe: "In Blüte geschaltet", titleEn: "Switched to flower", contentDe: "12/12 Lichtzyklus gestartet. Die Blüte beginnt!", contentEn: "12/12 light cycle started. Flowering begins!", humidity: 50, temperature: 24 },
    { diaryId: 2, day: 1, week: 1, titleDe: "Direkt in Coco", titleEn: "Straight into coco", contentDe: "Samen direkt in der End-Coco platziert.", contentEn: "Seeds placed directly in final coco.", humidity: 75, temperature: 26 },
    { diaryId: 2, day: 30, week: 4, titleDe: "Autoflower blüht", titleEn: "Autoflower flowering", contentDe: "Die Auto hat von selbst angefangen zu blühen. Schöne Buds!", contentEn: "The auto started flowering on its own. Beautiful buds!", humidity: 45, temperature: 24 },
  ]);
  console.log("Grow diary entries seeded");

  // Media
  await db.insert(media).values([
    { filename: "grow-setup.jpg", originalName: "Grow Setup", url: "/images/grow-setup.jpg", type: "image", sizeBytes: 204800, captionDe: "Indoor Grow Setup", captionEn: "Indoor Grow Setup" },
    { filename: "seedling.jpg", originalName: "Cannabis Seedling", url: "/images/seedling.jpg", type: "image", sizeBytes: 153600, captionDe: "Cannabis Sämling", captionEn: "Cannabis Seedling" },
    { filename: "buds.jpg", originalName: "Cannabis Buds", url: "/images/buds.jpg", type: "image", sizeBytes: 256000, captionDe: "Cannabis Blüten", captionEn: "Cannabis Buds" },
    { filename: "plant.jpg", originalName: "Healthy Plant", url: "/images/plant.jpg", type: "image", sizeBytes: 307200, captionDe: "Gesunde Pflanze", captionEn: "Healthy Plant" },
  ]);
  console.log("Media seeded");

  console.log("Seeding complete!");
}

seed().catch(console.error);
