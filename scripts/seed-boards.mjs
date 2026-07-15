// npx node scripts/seed-boards.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// dotenv
require("dotenv/config");

const { PrismaNeonHttp } = require("@prisma/adapter-neon");
const { PrismaClient } = require("./app/generated/prisma/client/index.js");

const url = (process.env.DATABASE_URL ?? "").replace("&channel_binding=require", "");
const adapter = new PrismaNeonHttp(url);
const db = new PrismaClient({ adapter });

const BOARDS = [
  { name: "자유게시판", slug: "free", order: 0 },
  { name: "K리그", slug: "kleague", order: 1 },
  { name: "EPL", slug: "epl", order: 2 },
  { name: "라리가", slug: "laliga", order: 3 },
  { name: "분데스리가", slug: "bundesliga", order: 4 },
  { name: "세리에A", slug: "seriea", order: 5 },
  { name: "챔피언스리그", slug: "ucl", order: 6 },
  { name: "리그앙", slug: "ligue1", order: 7 },
];

for (const board of BOARDS) {
  const result = await db.board.upsert({
    where: { slug: board.slug },
    update: { name: board.name, order: board.order },
    create: board,
  });
  console.log(`✓ ${result.slug} (${result.id})`);
}

await db.$disconnect();
console.log("완료");
