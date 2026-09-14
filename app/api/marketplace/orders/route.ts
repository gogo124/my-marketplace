import { NextResponse } from "next/server";
import { createResellingOrder } from "@/lib/reselling-marketplace";

export async function POST(request: Request) {
  try {
    const result = await createResellingOrder(await request.json());

    if (!result.data) {
      return NextResponse.json(
        { error: result.error || "Could not create order." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { orderNumber: result.data.orderNumber },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not create order." },
      { status: 500 }
    );
  }
}
