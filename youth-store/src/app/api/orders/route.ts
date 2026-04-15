import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { serializeProduct } from "@/lib/product-serialize";

export async function GET() {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      orders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        product: serializeProduct(o.product),
      })),
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, phone, city, productId, selectedColor } = body as Record<string, unknown>;

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof city !== "string" ||
      !city.trim() ||
      typeof productId !== "string" ||
      !productId.trim()
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId.trim() },
      select: { id: true, colorVariants: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 400 });
    }

    const variants = Array.isArray(product.colorVariants)
      ? product.colorVariants
      : [];
    const variantNames = variants
      .filter((v): v is { name: string } => Boolean(v && typeof v === "object" && typeof (v as { name?: unknown }).name === "string"))
      .map((v) => v.name);

    const color =
      typeof selectedColor === "string" && selectedColor.trim().length > 0
        ? selectedColor.trim()
        : null;

    if (variantNames.length > 0 && (!color || !variantNames.includes(color))) {
      return NextResponse.json({ error: "Invalid color variant" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        productId: productId.trim(),
        selectedColor: color,
      },
      include: { product: true },
    });

    return NextResponse.json(
      {
        ...order,
        createdAt: order.createdAt.toISOString(),
        product: serializeProduct(order.product),
      },
      { status: 201 },
    );
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === "P2003") {
      return NextResponse.json({ error: "Product not found" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
