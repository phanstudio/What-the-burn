import { Settings, LayoutDashboard } from 'lucide-react'
import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

function AdminLayout() {
    const location = useLocation()

    // Helper function to determine if a link is active
    const isActive = (path) => location.pathname === path

    return (
        <div className="flex flex-col min-h-screen bg-[#0F1A1F]">
            <div className="flex justify-between flex-col sm:flex-row items-center px-9 py-6">
                <h1 className="text-4xl text-[#50D2C1] font-bold mb-2">Admin</h1>

                {/* Navigation Links */}
                <div className="flex items-center gap-6">
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive('/admin/dashboard')
                            ? 'bg-[#50D2C1] text-[#0F1A1F]'
                            : 'text-[#50D2C1] hover:text-white hover:bg-[#50D2C1]/10'
                            }`}
                        aria-label="Admin Dashboard"
                    >
                        <LayoutDashboard size={24} />
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/settings"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive('/admin/settings')
                            ? 'bg-[#50D2C1] text-[#0F1A1F]'
                            : 'text-[#50D2C1] hover:text-white hover:bg-[#50D2C1]/10'
                            }`}
                        aria-label="Admin Settings"
                    >
                        <Settings size={24} />
                        <span className="font-medium">Settings</span>
                    </Link>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-9 pb-6">
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout