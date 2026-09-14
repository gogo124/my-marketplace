import { NextResponse } from "next/server";
import { createResellingOrder } from "@/lib/reselling-marketplace";

export async function POST(request: Request) {
  try {
    const result = await createResellingOrder(await request.json());
    const orderNumber = "data" in result ? result.data?.orderNumber : undefined;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "error" in result ? result.error : "Could not create order." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { orderNumber },
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
