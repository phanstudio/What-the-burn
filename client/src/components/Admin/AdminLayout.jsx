import { Settings, LayoutDashboard } from 'lucide-react'
import React, { useState, useEffect, createContext, useContext } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAdmin } from '../custom/AdminContext';

// Create context for admin data
const AdminDataContext = createContext();

// Hook to use admin data context
export const useAdminData = () => {
    const context = useContext(AdminDataContext);
    if (!context) {
        throw new Error('useAdminData must be used within AdminLayout');
    }
    return context;
};

function AdminLayout() {
    const location = useLocation()
    const [pendingItems, setPendingItems] = useState([]);
    const [approvedItems, setApprovedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add settings data state
    const [settingsData, setSettingsData] = useState({
        burnAmount: 25,
        createPrice: 0.05,
    });
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);
    const [settingsError, setSettingsError] = useState(null);

    // Helper function to determine if a link is active
    const isActive = (path) => location.pathname === path

    const { isAdmin } = useAdmin();
    if (!isAdmin) return <Navigate to="/" replace />;

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        const jwt = sessionStorage.getItem('jwt'); // still need something to check the jwt disconnect and send back
        if (!jwt) return; // send back if no jwt, if unauthorized send the back

        try {
            setIsLoading(true);
            setError(null);
            const uri = 'https://what-the-burn-backend-phanstudios-projects.vercel.app'
            const [pendingRes, approvedRes] = await Promise.all([
                axios.get(uri + '/update-requests/?downloaded=false', {
                    headers: {
                        Authorization: `Token ${jwt}`
                    }
                }),
                axios.get(uri + '/update-requests/?downloaded=true', {
                    headers: {
                        Authorization: `Token ${jwt}`
                    }
                })
            ]);
            setPendingItems(pendingRes.data);
            setApprovedItems(approvedRes.data);
        } catch (error) {
            console.error("Error fetching update requests:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch settings data
    const fetchSettingsData = async () => {
        const jwt = sessionStorage.getItem('jwt');
        if (!jwt) return;

        try {
            setIsSettingsLoading(true);
            setSettingsError(null);
            const response = await axios.get(
                `https://what-the-burn-backend-phanstudios-projects.vercel.app/app-settings/`,
                {
                    headers: {
                        Authorization: `Token ${jwt}`
                    }
                }
            );
            setSettingsData({
                burnAmount: response.data.amount_to_burn,
                createPrice: parseFloat(response.data.base_fee)
            });
        } catch (error) {
            console.error('❌ Failed to fetch settings data:', error);
            setSettingsError(error.message);
        } finally {
            setIsSettingsLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchDashboardData();
        fetchSettingsData();
    }, []);

    // Function to refresh dashboard data (can be called from child components)
    const refreshData = async () => {
        try {
            setError(null);
            const uri = 'https://what-the-burn-backend-phanstudios-projects.vercel.app'
            const [pendingRes, approvedRes] = await Promise.all([
                axios.get(uri + '/update-requests/?downloaded=false'),
                axios.get(uri + '/update-requests/?downloaded=true')
            ]);
            setPendingItems(pendingRes.data);
            setApprovedItems(approvedRes.data);
        } catch (error) {
            console.error("Error refreshing update requests:", error);
            setError(error.message);
        }
    };

    // Function to refresh settings data
    const refreshSettingsData = async () => {
        await fetchSettingsData();
    };

    // Context value to provide to child components
    const contextValue = {
        pendingItems,
        setPendingItems,
        approvedItems,
        setApprovedItems,
        isLoading,
        error,
        refreshData,
        // Settings data
        settingsData,
        setSettingsData,
        isSettingsLoading,
        settingsError,
        refreshSettingsData
    };

    return (
        <AdminDataContext.Provider value={contextValue}>
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
        </AdminDataContext.Provider>
    )
}

export default AdminLayout