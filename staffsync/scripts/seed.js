/**
 * scripts/seed.js
 * Author: StaffSync Team
 * Description: One-off script (run with `npm run seed`) that populates a
 * fresh MongoDB database with a starter admin account, a couple of
 * departments, and a couple of employees, so the app has data to explore
 * immediately after setup. Inputs: none (reads MONGODB_URI from
 * .env.local). Processing: connects to Mongo, clears existing test data,
 * inserts the seed records. Output: console log of created records.
 */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

const DepartmentSchema = new mongoose.Schema(
  { name: String, description: String },
  { timestamps: true }
);
const EmployeeSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    position: String,
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    status: String,
    hireDate: Date,
  },
  { timestamps: true }
);
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    passwordHash: String,
    role: String,
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const Department = mongoose.model("Department", DepartmentSchema);
  const Employee = mongoose.model("Employee", EmployeeSchema);
  const User = mongoose.model("User", UserSchema);

  const engineering = await Department.create({
    name: "Engineering",
    description: "Product development and IT.",
  });
  const hr = await Department.create({
    name: "Human Resources",
    description: "Hiring, onboarding, and employee relations.",
  });

  const adminEmployee = await Employee.create({
    firstName: "Ada",
    lastName: "Admin",
    email: "ada.admin@staffsync.test",
    position: "HR Manager",
    department: hr._id,
    status: "active",
  });
  const staffEmployee = await Employee.create({
    firstName: "Eli",
    lastName: "Employee",
    email: "eli.employee@staffsync.test",
    position: "Software Developer",
    department: engineering._id,
    status: "active",
  });

  const adminPasswordHash = await bcrypt.hash("Admin1234!", 10);
  const staffPasswordHash = await bcrypt.hash("Employee1234!", 10);

  await User.create({
    name: "Ada Admin",
    email: "admin@staffsync.test",
    passwordHash: adminPasswordHash,
    role: "admin",
    employee: adminEmployee._id,
  });
  await User.create({
    name: "Eli Employee",
    email: "employee@staffsync.test",
    passwordHash: staffPasswordHash,
    role: "employee",
    employee: staffEmployee._id,
  });

  console.log("Seed complete.");
  console.log("  Admin login:    admin@staffsync.test / Admin1234!");
  console.log("  Employee login: employee@staffsync.test / Employee1234!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
