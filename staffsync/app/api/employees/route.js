/**
 * app/api/employees/route.js
 * Description: REST endpoints for the Employee collection.
 *   GET  /api/employees            - list employees, supports ?search= and
 *                                     ?department= query params (any logged
 *                                     -in user may view the list).
 *   POST /api/employees            - create a new employee (admin only).
 * Processing: dbConnect() is awaited before every query so requests can be
 * served concurrently without blocking on a fresh connection each time.
 */

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { requireRole } from "@/lib/requireRole";

export async function GET(request) {
  const { error } = await requireRole(); // any authenticated user
  if (error) return error;

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const department = searchParams.get("department");

  const query = {};
  if (search) {
    // Case-insensitive partial match across name and email.
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (department) query.department = department;

  const employees = await Employee.find(query)
    .populate("department", "name")
    .sort({ lastName: 1 });

  return NextResponse.json(employees);
}

export async function POST(request) {
  const { error } = await requireRole(["admin"]);
  if (error) return error;

  try {
    const body = await request.json();
    await dbConnect();

    const employee = await Employee.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      position: body.position,
      department: body.department,
      status: body.status || "active",
      hireDate: body.hireDate || Date.now(),
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (err) {
    console.error("Create employee error:", err);
    return NextResponse.json(
      { error: "Could not create employee. Check the submitted fields." },
      { status: 400 }
    );
  }
}
