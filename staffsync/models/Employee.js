/**
 * models/Employee.js
 * Description: Defines the Employee collection schema, which stores the HR
 * record for each staff member (distinct from their login User document).
 * Each employee is linked to a Department by reference so that department
 * data stays in one place and can be updated without touching every
 * employee record.
 */

import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    position: { type: String, trim: true, default: "" },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    hireDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);
