import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import {
  getMyCompany,
  inviteMember,
  removeMember,
  updateMember,
} from "../../api/company";

const ROLE_LABELS = {
  OWNER: "Owner",
  INVENTORY_MANAGER: "Inventory Manager",
  WAREHOUSE_STAFF: "Warehouse Staff",
};

export default function CompanyManagementPage() {
  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "WAREHOUSE_STAFF",
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyCompany();
      setCompany(data.company);
      setMembers(data.members || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    setInviting(true);
    try {
      const data = await inviteMember(inviteForm);
      setInviteSuccess(
        data.tempPassword
          ? `Invited ${data.member.email}. Temp password (dev): ${data.tempPassword}`
          : `Invite sent to ${data.member.email}`,
      );
      setInviteForm({ name: "", email: "", role: "WAREHOUSE_STAFF" });
      await load();
    } catch (err) {
      setInviteError(err.response?.data?.message || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateMember(userId, { role });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Remove this member from the company?")) return;
    try {
      await removeMember(userId);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activePage="company" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Company Management</h1>
          <p className="text-slate-500 mt-1">
            View company details and invite inventory managers or warehouse staff.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : company ? (
          <div className="space-y-8">
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Company Details
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500">Name</dt>
                  <dd className="font-medium text-slate-900 mt-1">{company.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="font-medium text-slate-900 mt-1">{company.phone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Address</dt>
                  <dd className="font-medium text-slate-900 mt-1">{company.address}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">GST Number</dt>
                  <dd className="font-medium text-slate-900 mt-1">{company.gstNumber}</dd>
                </div>
              </dl>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Invite Member
              </h2>

              {inviteError && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {inviteSuccess}
                </div>
              )}

              <form
                onSubmit={handleInvite}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, name: e.target.value })
                    }
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    placeholder="colleague@company.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, role: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
                    <option value="INVENTORY_MANAGER">Inventory Manager</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={inviting}
                    className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {inviting ? "Inviting..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Members ({members.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Email</th>
                      <th className="py-2 pr-4 font-medium">Role</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-medium text-slate-900">
                          {m.name}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{m.email}</td>
                        <td className="py-3 pr-4">
                          {m.role === "OWNER" ? (
                            <span className="text-slate-900 font-medium">
                              {ROLE_LABELS[m.role]}
                            </span>
                          ) : (
                            <select
                              value={m.role}
                              onChange={(e) =>
                                handleRoleChange(m.id, e.target.value)
                              }
                              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5"
                            >
                              <option value="WAREHOUSE_STAFF">
                                Warehouse Staff
                              </option>
                              <option value="INVENTORY_MANAGER">
                                Inventory Manager
                              </option>
                            </select>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {m.mustResetPassword ? (
                            <span className="text-amber-700">Pending reset</span>
                          ) : (
                            <span className="text-emerald-700">Active</span>
                          )}
                        </td>
                        <td className="py-3">
                          {m.role !== "OWNER" && (
                            <button
                              type="button"
                              onClick={() => handleRemove(m.id)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
