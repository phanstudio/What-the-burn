import { Settings } from 'lucide-react'
import React from 'react'
import { Outlet } from 'react-router-dom'



function AdminLayout() {
    return (
        <div>
            <div className="flex flex-col  min-h-screen bg-gray-100">
                <div className="flex justify-between">
                    <h1 className="text-4xl font-bold mb-6">Admin</h1>
                    {/* Settings Icon */}
                    <div className="flex items-center gap-4">
                        <Settings size={50} />
                        <span className="text-2xl font-semibold">Settings</span>
                    </div>
                </div>
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout