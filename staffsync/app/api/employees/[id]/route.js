/**
 * app/api/employees/[id]/route.js
 * Description: REST endpoints for a single Employee document, addressed by
 * its MongoDB _id.
 *   GET    - fetch one employee (any authenticated user; an employee may
 *            view their own record, admins may view any).
 *   PUT    - update an employee (admin, or the employee updating their own
 *            record).
 *   DELETE - remove an employee (admin only).
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import User from "@/models/User";
import { requireRole } from "@/lib/requireRole";

async function isOwnRecordOrAdmin(session, employeeId) {
  if (session.user.role === "admin") return true;
  const user = await User.findById(session.user.id);
  return user?.employee?.toString() === employeeId;
}

export async function GET(request, { params }) {
  const { session, error } = await requireRole();
  if (error) return error;

  await dbConnect();
  const employee = await Employee.findById(params.id).populate(
    "department",
    "name"
  );
  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }
  return NextResponse.json(employee);
}

export async function PUT(request, { params }) {
  const { session, error } = await requireRole();
  if (error) return error;

  await dbConnect();

  const allowed = await isOwnRecordOrAdmin(session, params.id);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Non-admins may only touch a limited set of self-service fields.
    const updates =
      session.user.role === "admin"
        ? body
        : { position: body.position, email: body.email };

    const employee = await Employee.findByIdAndUpdate(params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }
    return NextResponse.json(employee);
  } catch (err) {
    console.error("Update employee error:", err);
    return NextResponse.json({ error: "Update failed." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  await dbConnect();
  const deleted = await Employee.findByIdAndDelete(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }
  return NextResponse.json({ message: "Employee deleted." });
}
