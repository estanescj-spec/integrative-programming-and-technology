import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data.users);
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (id, body) => {
    try {
      await api.put(`/admin/user/${id}`, body);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    await api.delete(`/admin/user/${id}`);
    toast.success("User deleted");
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-900 mb-5">Users</h2>
      <div className="bg-white rounded-2xl border border-slate-200/70 card-shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-xs uppercase text-slate-400">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Active</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100">
                <td className="p-3 font-bold">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => patch(u._id, { role: e.target.value })}
                    className="border border-slate-200 rounded-xl px-2 py-1"
                  >
                    <option>customer</option>
                    <option>admin</option>
                  </select>
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={u.isActive}
                    onChange={(e) => patch(u._id, { isActive: e.target.checked })}
                  />
                </td>
                <td className="p-3">
                  <button onClick={() => remove(u._id)} className="text-red-500 font-bold">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
