/**
 * app/api/departments/route.js
 * Description: REST endpoints for the Department collection.
 *   GET  /api/departments  - list all departments with a live employee
 *                             count (any authenticated user).
 *   POST /api/departments  - create a department (admin only).
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Department from "@/models/Department";
import Employee from "@/models/Employee";
import { requireRole } from "@/lib/requireRole";

export async function GET() {
  const { error } = await requireRole();
  if (error) return error;

  await dbConnect();
  const departments = await Department.find().sort({ name: 1 }).lean();

  // Attach a headcount per department for the dashboard/overview chart.
  const withCounts = await Promise.all(
    departments.map(async (dept) => ({
      ...dept,
      employeeCount: await Employee.countDocuments({ department: dept._id }),
    }))
  );

  return NextResponse.json(withCounts);
}

export async function POST(request) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  try {
    const { name, description } = await request.json();
    await dbConnect();
    const department = await Department.create({ name, description });
    return NextResponse.json(department, { status: 201 });
  } catch (err) {
    console.error("Create department error:", err);
    return NextResponse.json(
      { error: "Could not create department (name may already exist)." },
      { status: 400 }
    );
  }
}
