"use client";

/**
 * app/leave-requests/page.js
 * Description: Shows leave requests scoped by role (the API already
 * filters: employees only get their own, admins get everyone's). Employees
 * can submit a new request; admins can approve or reject pending ones.
 */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function LeaveRequestsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    setLoading(true);
    const res = await fetch("/api/leave-requests");
    setRequests(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/leave-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Submission failed.");
      return;
    }
    setForm({ startDate: "", endDate: "", reason: "" });
    loadRequests();
  }

  async function handleReview(id, status) {
    await fetch(`/api/leave-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadRequests();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>

      {!isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-5"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Start date</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">End date</label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-sm font-medium">Reason</label>
            <input
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Submit Request
          </button>
        </form>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Loading requests…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                {isAdmin && <th className="px-4 py-3">Employee</th>}
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {r.employee?.firstName} {r.employee?.lastName}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {new Date(r.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(r.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.reason || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right space-x-2">
                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleReview(r._id, "approved")}
                            className="text-green-600 hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(r._id, "rejected")}
                            className="text-red-600 hover:underline"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 4}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}
