import { NextResponse } from "next/server";
import { saveLead } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    saveLead({
      name: body.name,
      email,
      phone: body.phone,
      business_type: body.business_type,
      service_tier: body.service_tier,
      message: body.message,
      roadmap_data: body.roadmap_data,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    );
  }
}
