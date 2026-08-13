/**
 * app/api/departments/[id]/route.js
 * Description: Update or delete a single Department. Both operations are
 * admin-only. Deletion is blocked if employees are still assigned to the
 * department, to preserve referential integrity (an employee must always
 * point at a real department).
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Department from "@/models/Department";
import Employee from "@/models/Employee";
import { requireRole } from "@/lib/requireRole";

export async function PUT(request, { params }) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  try {
    const body = await request.json();
    await dbConnect();
    const department = await Department.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!department) {
      return NextResponse.json({ error: "Department not found." }, { status: 404 });
    }
    return NextResponse.json(department);
  } catch (err) {
    console.error("Update department error:", err);
    return NextResponse.json({ error: "Update failed." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  await dbConnect();

  const employeeCount = await Employee.countDocuments({ department: params.id });
  if (employeeCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${employeeCount} employee(s) still assigned.` },
      { status: 409 }
    );
  }

  const deleted = await Department.findByIdAndDelete(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Department not found." }, { status: 404 });
  }
  return NextResponse.json({ message: "Department deleted." });
}
