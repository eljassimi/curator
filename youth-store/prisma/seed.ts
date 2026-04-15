import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const seedProducts = [
  {
    name: "Heavyweight Cotton Henley",
    nameFr: "Henley coton épais",
    nameAr: "هينلي قطني ثقيل",
    description: "Premium heavyweight cotton henley tailored for everyday comfort.",
    descriptionFr: "Henley en coton premium, coupe confortable pour tous les jours.",
    descriptionAr: "هينلي قطني فاخر بقصة مريحة للاستخدام اليومي.",
    price: 85,
    categories: ["T-Shirt", "Men"],
    images: [
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
    ],
    colorVariants: [
      { name: "Off White", hex: "#F2EFE9" },
      { name: "Slate", hex: "#767A7D" },
    ],
  },
  {
    name: "Architectural Denim Jacket",
    nameFr: "Veste denim architecturale",
    nameAr: "جاكيت دينم معماري",
    description: "Structured denim jacket in raw indigo with clean lines.",
    descriptionFr: "Veste en denim brut indigo, lignes nettes et coupe structurée.",
    descriptionAr: "جاكيت دينم نيلي خام بخطوط نظيفة وقصة منظمة.",
    price: 210,
    categories: ["Jackets", "Men", "Women"],
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop",
    ],
    colorVariants: [{ name: "Indigo Raw", hex: "#1E2A44" }],
  },
  {
    name: "Ventilated Linen Trouser",
    nameFr: "Pantalon lin ventilé",
    nameAr: "بنطال كتان خفيف",
    description: "Airy linen trouser with tailored drape and relaxed fit.",
    descriptionFr: "Pantalon en lin léger avec tombé élégant et coupe relax.",
    descriptionAr: "بنطال كتان خفيف بانسيابية أنيقة وقصة مريحة.",
    price: 120,
    categories: ["Pants", "Women"],
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1200&auto=format&fit=crop",
    ],
    colorVariants: [
      { name: "Sand Dune", hex: "#D6C3A5" },
      { name: "Olive", hex: "#6C6F46" },
    ],
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@curator.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { passwordHash },
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash,
    },
  });

  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  for (const p of seedProducts) {
    await prisma.product.create({ data: p });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
