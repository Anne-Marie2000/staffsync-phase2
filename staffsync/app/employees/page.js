"use client";

/**
 * app/employees/page.js
 * Description: Employee directory page. Supports searching by name/email
 * and filtering by department via query params sent to the REST API.
 * Admins can add new employees inline via EmployeeForm.
 */

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import EmployeeTable from "@/components/EmployeeTable";
import EmployeeForm from "@/components/EmployeeForm";

export default function EmployeesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEmployees = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (departmentFilter) params.set("department", departmentFilter);

    const res = await fetch(`/api/employees?${params.toString()}`);
    setEmployees(await res.json());
  }, [search, departmentFilter]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const deptRes = await fetch("/api/departments");
      setDepartments(await deptRes.json());
      await loadEmployees();
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-run the search whenever the search text or department filter changes.
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {showForm ? "Close" : "+ Add Employee"}
          </button>
        )}
      </div>

      {showForm && (
        <EmployeeForm
          departments={departments}
          onSaved={() => {
            setShowForm(false);
            loadEmployees();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading employees…</p>
      ) : (
        <EmployeeTable
          employees={employees}
          isAdmin={isAdmin}
          onDeleted={loadEmployees}
        />
      )}
    </div>
  );
}
