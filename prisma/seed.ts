import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

console.log("Connecting to:", process.env.DATABASE_URL?.slice(0, 40) + "...");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter } as never);

const boards = [
  { slug: "free", name: "자유게시판", order: 1 },
  { slug: "kleague", name: "K리그", order: 2 },
  { slug: "epl", name: "EPL", order: 3 },
  { slug: "laliga", name: "라리가", order: 4 },
  { slug: "bundesliga", name: "분데스리가", order: 5 },
  { slug: "seriea", name: "세리에A", order: 6 },
  { slug: "ucl", name: "챔피언스리그", order: 7 },
  { slug: "transfer", name: "이적시장", order: 8 },
  { slug: "highlight", name: "하이라이트", order: 9 },
];

async function main() {
  for (const board of boards) {
    await db.board.upsert({
      where: { slug: board.slug },
      update: {},
      create: board,
    });
    console.log(`✓ ${board.name}`);
  }
  console.log("게시판 시드 완료");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
