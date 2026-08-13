"use client";

/**
 * app/employees/[id]/page.js
 * Description: Employee profile page. Fetches a single employee by id and
 * lets it be edited in place - the API route enforces that non-admins may
 * only edit their own record, so this page simply attempts the PUT and
 * surfaces any error the server returns.
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState({ position: "", email: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/employees/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployee(data);
        setForm({ position: data.position || "", email: data.email });
      }
    }
    load();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Update failed.");
      return;
    }
    router.push("/employees");
  }

  if (!employee) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="mb-1 text-xl font-bold text-slate-800">
        {employee.firstName} {employee.lastName}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {employee.department?.name} · Hired{" "}
        {new Date(employee.hireDate).toLocaleDateString()}
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Position</label>
          <input
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
