"use client";

import { useState } from "react";
import { Plus, Search, MoreVertical, Shield, Users, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function RoleManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rolesData, setRolesData] = useState([
    {
      id: 1,
      name: "Owner / Admin",
      description: "Full access to all features and settings",
      usersCount: 2,
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: 2,
      name: "Manager",
      description: "Can manage staff, inventory, and view reports",
      usersCount: 3,
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: 3,
      name: "Cashier",
      description: "Process sales and handle payments",
      usersCount: 5,
      color: "bg-green-100 text-green-700",
    },
    {
      id: 4,
      name: "Baker / Production Staff",
      description: "Manage production queue and inventory usage",
      usersCount: 8,
      color: "bg-orange-100 text-orange-700",
    },
    {
      id: 5,
      name: "Accountant",
      description: "Access to financial records and ledgers",
      usersCount: 2,
      color: "bg-cyan-100 text-cyan-700",
    },
    {
      id: 6,
      name: "Storekeeper / Inventory Manager",
      description: "Manage stock levels and purchase orders",
      usersCount: 2,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      id: 7,
      name: "Viewer / Auditor",
      description: "Read-only access to reports and logs",
      usersCount: 1,
      color: "bg-gray-100 text-gray-700",
    },
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [editedRoleName, setEditedRoleName] = useState("");
  const [editedRoleDescription, setEditedRoleDescription] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const filteredRoles = rolesData.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (role) => {
    setCurrentRole(role);
    setEditedRoleName(role.name);
    setEditedRoleDescription(role.description);
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDeleteClick = (role) => {
    setCurrentRole(role);
    setIsDeleteModalOpen(true);
    setActiveDropdown(null);
  };

  const handleSaveEdit = () => {
    setRolesData((prevRoles) =>
      prevRoles.map((role) =>
        role.id === currentRole.id
          ? { ...role, name: editedRoleName, description: editedRoleDescription }
          : role
      )
    );
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    setRolesData((prevRoles) => prevRoles.filter((role) => role.id !== currentRole.id));
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6" onClick={() => setActiveDropdown(null)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-500">Define roles and assign permissions</p>
        </div>
        <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={20} className="mr-2" />
          Add New Role
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search roles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${role.color}`}>
                <Shield size={24} />
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === role.id ? null : role.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical size={20} />
                </button>
                
                {activeDropdown === role.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10 py-1">
                    <button
                      onClick={() => handleEditClick(role)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Role
                    </button>
                    <button
                      onClick={() => handleDeleteClick(role)}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Role
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">{role.name}</h3>
            <p className="text-sm text-gray-500 mb-4 min-h-[40px]">
              {role.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2" />
                <span>{role.usersCount} Users</span>
              </div>
              <button 
                onClick={() => handleEditClick(role)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Edit Permissions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                type="text"
                value={editedRoleName}
                onChange={(e) => setEditedRoleName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editedRoleDescription}
                onChange={(e) => setEditedRoleDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">Delete Role?</DialogTitle>
            <p className="text-gray-500">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{currentRole?.name}"</span>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
