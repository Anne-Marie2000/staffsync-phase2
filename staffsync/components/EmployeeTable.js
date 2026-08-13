"use client";

/**
 * components/EmployeeTable.js
 * Description: Renders the employee list as a table. Admins get a Delete
 * action; everyone gets a link through to the employee's detail page.
 * onDeleted() lets the parent page refresh its data after a row is
 * removed.
 */

import Link from "next/link";

export default function EmployeeTable({ employees, isAdmin, onDeleted }) {
  async function handleDelete(id) {
    if (!confirm("Remove this employee? This cannot be undone.")) return;
    const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Position</th>
            <th className="px-4 py-3">Status</th>
            {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((emp) => (
            <tr key={emp._id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link
                  href={`/employees/${emp._id}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  {emp.firstName} {emp.lastName}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-500">{emp.email}</td>
              <td className="px-4 py-3">{emp.department?.name || "—"}</td>
              <td className="px-4 py-3">{emp.position || "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    emp.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {emp.status}
                </span>
              </td>
              {isAdmin && (
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
