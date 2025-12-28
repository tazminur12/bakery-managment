"use client";

import Link from "next/link";
import { Users, Shield, Key, Bell, Store } from "lucide-react";

const settingsOptions = [
  {
    title: "Role Management",
    description: "Manage user roles and permissions",
    icon: Shield,
    href: "/dashboard/settings/roles",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Users",
    description: "Manage system users",
    icon: Users,
    href: "/dashboard/settings/users",
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "General Settings",
    description: "Store information and preferences",
    icon: Store,
    href: "/dashboard/settings/general",
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Security",
    description: "Password and security settings",
    icon: Key,
    href: "/dashboard/settings/security",
    color: "bg-rose-100 text-rose-600",
  },
  {
    title: "Notifications",
    description: "Email and alert preferences",
    icon: Bell,
    href: "/dashboard/settings/notifications",
    color: "bg-amber-100 text-amber-600",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your application settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsOptions.map((option) => (
          <Link
            key={option.title}
            href={option.href}
            className="block p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${option.color}`}>
                <option.icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {option.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
