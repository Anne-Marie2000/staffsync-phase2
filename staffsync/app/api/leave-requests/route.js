/**
 * app/api/leave-requests/route.js
 * Description: REST endpoints for the LeaveRequest collection.
 *   GET  /api/leave-requests  - admins see all requests; employees see only
 *                               requests tied to their own Employee record.
 *   POST /api/leave-requests  - any authenticated employee submits a
 *                               request for themselves.
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LeaveRequest from "@/models/LeaveRequest";
import User from "@/models/User";
import { requireRole } from "@/lib/requireRole";

export async function GET() {
  const { session, error } = await requireRole();
  if (error) return error;

  await dbConnect();

  let query = {};
  if (session.user.role !== "admin") {
    const user = await User.findById(session.user.id);
    if (!user?.employee) return NextResponse.json([]);
    query = { employee: user.employee };
  }

  const requests = await LeaveRequest.find(query)
    .populate({ path: "employee", select: "firstName lastName email" })
    .sort({ createdAt: -1 });

  return NextResponse.json(requests);
}

export async function POST(request) {
  const { session, error } = await requireRole();
  if (error) return error;

  await dbConnect();
  const user = await User.findById(session.user.id);
  if (!user?.employee) {
    return NextResponse.json(
      { error: "Your account is not linked to an employee record." },
      { status: 400 }
    );
  }

  try {
    const { startDate, endDate, reason } = await request.json();
    const leaveRequest = await LeaveRequest.create({
      employee: user.employee,
      startDate,
      endDate,
      reason,
      status: "pending",
    });
    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (err) {
    console.error("Create leave request error:", err);
    return NextResponse.json({ error: "Submission failed." }, { status: 400 });
  }
}
