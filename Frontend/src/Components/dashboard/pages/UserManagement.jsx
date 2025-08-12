import React, { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { FaUsers, FaSearch } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { store } from "../../../state/store";
import axios from "axios";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

const createApiClient = () => {
  const api = axios.create({ baseURL: BASE_URL });
  api.interceptors.request.use((config) => {
    const token = store.getState().user.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return api;
};

// --- Helper Components ---

const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: "bg-purple-100 text-purple-800",
    driver: "bg-yellow-100 text-yellow-800",
    passenger: "bg-green-100 text-green-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        roleStyles[role] || "bg-gray-100 text-gray-700"
      }`}
    >
      {role}
    </span>
  );
};

// --- THIS COMPONENT IS NOW CORRECT ---
const StatusToggle = ({ user, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    // FIX: Pass an object with the key 'is_active', as expected by the backend serializer.
    await onToggle(user.pkid, { is_active: !user.is_active });
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center justify-center"
    >
      {loading ? (
        <Loader2 className="animate-spin text-gray-400" size={20} />
      ) : (
        <div
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            user.is_active ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              user.is_active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </div>
      )}
    </button>
  );
};

// --- THIS COMPONENT IS NOW CORRECT ---
const EditRoleModal = ({ user, onClose, onSave }) => {
  const roles = [
    { value: "passenger", label: "Passenger" },
    { value: "driver", label: "Driver" },
    { value: "admin", label: "Admin" },
  ];
  const [selectedRole, setSelectedRole] = useState(
    roles.find((r) => r.value === user.role)
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // FIX: Pass an object with the key 'role', as expected by the backend serializer.
    await onSave(user.pkid, { role: selectedRole.value });
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b">
          <h3 className="text-lg font-bold">Edit Role for {user.full_name}</h3>
        </div>
        <div className="p-5 space-y-4">
          <p>
            Select the new role for this user. Be aware that promoting a user to
            Admin gives them full access.
          </p>
          <Select
            options={roles}
            value={selectedRole}
            onChange={setSelectedRole}
          />
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="secondary-btn">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="primary-btn flex items-center justify-center"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Component ---
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const api = createApiClient();
    try {
      const response = await api.get("/api/v1/profiles/admin/users/");
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", "Could not load the list of users.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // This parent function now correctly receives a data OBJECT.
  const handleUpdateUser = async (userId, data) => {
    const api = createApiClient();
    try {
      await api.patch(`/api/v1/profiles/admin/users/${userId}/`, data);
      Swal.fire("Success", "User has been updated successfully.", "success");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);
      Swal.fire("Error", "Failed to update user.", "error");
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        (user.full_name &&
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.username &&
          user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  return (
    <>
      <AnimatePresence>
        {editingUser && (
          <EditRoleModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleUpdateUser}
          />
        )}
      </AnimatePresence>

      <div className="p-3 md:p-6 w-full">
        <div className="bg-white p-6 shadow-md rounded-lg max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
            <FaUsers /> User Management
          </h1>

          <div className="mb-4 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-full"
            />
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-5 py-3">Full Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Date Joined</th>
                    <th className="px-5 py-3 text-center">Active Status</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.pkid} className="border-b hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {user.full_name}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{user.email}</td>
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusToggle user={user} onToggle={handleUpdateUser} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Edit Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
