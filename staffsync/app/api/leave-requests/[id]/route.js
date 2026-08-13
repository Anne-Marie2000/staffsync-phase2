/**
 * app/api/leave-requests/[id]/route.js
 * Description: Approve/reject a leave request (admin only) or withdraw a
 * pending request (the employee who submitted it, or an admin).
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LeaveRequest from "@/models/LeaveRequest";
import { requireRole } from "@/lib/requireRole";

export async function PUT(request, { params }) {
  const { session, error } = await requireRole(["admin"]);
  if (error) return error;

  try {
    const { status } = await request.json(); // "approved" | "rejected"
    await dbConnect();

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      params.id,
      { status, reviewedBy: session.user.id },
      { new: true, runValidators: true }
    );

    if (!leaveRequest) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    return NextResponse.json(leaveRequest);
  } catch (err) {
    console.error("Update leave request error:", err);
    return NextResponse.json({ error: "Update failed." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole();
  if (error) return error;

  await dbConnect();
  const deleted = await LeaveRequest.findByIdAndDelete(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }
  return NextResponse.json({ message: "Leave request withdrawn." });
}
