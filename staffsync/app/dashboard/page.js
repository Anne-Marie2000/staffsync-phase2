"use client";

/**
 * app/dashboard/page.js
 * Description: Landing page after login. Fetches employees and departments
 * concurrently (Promise.all) and derives summary statistics client-side:
 * total employees, active employees, department count, and the five most
 * recently added employees. Also renders a simple bar-style department
 * overview using div widths 
 */

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [empRes, deptRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/departments"),
        ]);
        setEmployees(await empRes.json());
        setDepartments(await deptRes.json());
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <p className="text-slate-500">Loading dashboard…</p>;

  const activeCount = employees.filter((e) => e.status === "active").length;
  const recent = [...employees]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const maxCount = Math.max(1, ...departments.map((d) => d.employeeCount));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* Summary statistics cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Employees" value={employees.length} />
        <StatCard label="Active Employees" value={activeCount} />
        <StatCard label="Departments" value={departments.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recently added employees widget */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-700">
            Recently Added Employees
          </h2>
          <ul className="divide-y divide-slate-100">
            {recent.map((emp) => (
              <li key={emp._id} className="flex justify-between py-2 text-sm">
                <span>
                  {emp.firstName} {emp.lastName}
                </span>
                <span className="text-slate-400">
                  {emp.department?.name || "—"}
                </span>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="py-2 text-sm text-slate-400">No employees yet.</li>
            )}
          </ul>
          <Link
            href="/employees"
            className="mt-3 inline-block text-sm text-brand-600 hover:underline"
          >
            View all employees →
          </Link>
        </div>

        {/* Department overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-700">
            Department Overview
          </h2>
          <div className="space-y-3">
            {departments.map((d) => (
              <div key={d._id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{d.name}</span>
                  <span className="text-slate-400">{d.employeeCount}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: `${(d.employeeCount / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <p className="text-sm text-slate-400">No departments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-brand-600">{value}</p>
    </div>
  );
}
