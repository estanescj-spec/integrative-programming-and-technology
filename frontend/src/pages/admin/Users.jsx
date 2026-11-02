import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";
import { useAuth } from "../../hooks";
import {
  Avatar,
  Button,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);

  const load = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data.users);
  };

  useEffect(() => {
    load().catch((err) => toast.error(err.message));
  }, []);

  const patch = async (id, body) => {
    try {
      await api.put(`/admin/user/${id}`, body);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try {
      await api.delete(`/admin/user/${u._id}`);
      toast.success("User deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <TableContainer className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Active</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id} hover>
              <TableCell>
                <div className="flex items-center gap-2 font-bold text-black">
                  <Avatar
                    src={u.profilePhoto?.url}
                    sx={{ width: 32, height: 32, fontSize: 14 }}
                  >
                    {(u.name || "?")[0].toUpperCase()}
                  </Avatar>
                  {u.name}
                </div>
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Select
                  fullWidth={false}
                  value={u.role} disabled={u._id === me._id}
                  onChange={(e) => patch(u._id, { role: e.target.value })}
                  sx={{ minWidth: 120, fontSize: 13 }}
                >
                  <MenuItem value="customer">customer</MenuItem>
                  <MenuItem value="admin">admin</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Switch
                  checked={u.isActive} disabled={u._id === me._id}
                  onChange={(e) => patch(u._id, { isActive: e.target.checked })}
                />
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => remove(u)} disabled={u._id === me._id}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!users.length && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
