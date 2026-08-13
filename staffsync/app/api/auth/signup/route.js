/**
 * app/api/auth/signup/route.js
 * Description: Public endpoint that creates a new user account. New
 * accounts are always created with the "employee" role - only an existing
 * admin can promote someone to "admin" (via the users management screen),
 * which prevents a visitor from granting themselves admin rights through
 * the sign-up form.
 * Inputs (JSON body): name, email, password.
 * Processing: validates input, hashes the password, inserts the user.
 * Output: the created user's public fields, or an error message.
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    // Hash the password before it ever touches the database.
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "employee",
    });

    return NextResponse.json(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong creating the account." },
      { status: 500 }
    );
  }
}
