/**
 * models/User.js
 * Description: Defines the User collection schema. A User holds login
 * credentials (email + hashed password) and a role that drives
 * authorization ("admin" or "employee"). Optionally linked to an Employee
 * document for that person's HR record.
 */

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Never store plain-text passwords - only the bcrypt hash.
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
