import { NextResponse } from "next/server";
import { getPermitsForBusiness, getBusinessType } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessType, location, conditions = {} } = body;

    if (!businessType || !location) {
      return NextResponse.json(
        { error: "businessType and location are required" },
        { status: 400 }
      );
    }

    const bt = getBusinessType(businessType);
    if (!bt) {
      return NextResponse.json(
        { error: "Invalid business type" },
        { status: 400 }
      );
    }

    const permits = getPermitsForBusiness(businessType, location, conditions);

    let totalFeeLow = 0;
    let totalFeeHigh = 0;
    let maxTimelineLow = 0;
    let maxTimelineHigh = 0;
    const levels = new Set<string>();

    for (const p of permits) {
      totalFeeLow += p.fee_low ?? 0;
      totalFeeHigh += p.fee_high ?? 0;
      if (p.timeline_weeks_low > maxTimelineLow) maxTimelineLow = p.timeline_weeks_low;
      if (p.timeline_weeks_high > maxTimelineHigh) maxTimelineHigh = p.timeline_weeks_high;
      levels.add(p.level);
    }

    return NextResponse.json({
      businessType: bt,
      permits,
      summary: {
        totalPermits: permits.length,
        costLow: totalFeeLow,
        costHigh: totalFeeHigh,
        timelineLow: maxTimelineLow,
        timelineHigh: maxTimelineHigh,
        levels: Array.from(levels),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
