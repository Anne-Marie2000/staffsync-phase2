"use client";

/**
 * components/EmployeeForm.js
 * Description: Reusable form for creating a new employee. Validates
 * required fields client-side before submitting; the server re-validates
 * via the Mongoose schema regardless. Calls onSaved() after a successful
 * POST so the parent can refresh its list and close the form.
 */

import { useState } from "react";

export default function EmployeeForm({ departments, onSaved, onCancel }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    department: departments[0]?._id || "",
    status: "active",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.department) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not save employee.");
      return;
    }
    onSaved();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
    >
      <input
        name="firstName"
        placeholder="First name"
        value={form.firstName}
        onChange={handleChange}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        name="lastName"
        placeholder="Last name"
        value={form.lastName}
        onChange={handleChange}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <input
        name="position"
        placeholder="Position"
        value={form.position}
        onChange={handleChange}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <select
        name="department"
        value={form.department}
        onChange={handleChange}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        {departments.map((d) => (
          <option key={d._id} value={d._id}>
            {d.name}
          </option>
        ))}
      </select>
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}

      <div className="col-span-2 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Employee"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
