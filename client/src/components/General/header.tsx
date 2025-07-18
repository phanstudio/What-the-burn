import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Flame } from "lucide-react";
import { useAdmin } from '../custom/AdminContext';

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { address, isConnected } = useAccount();
	const { isAdmin } = useAdmin();

	return (
		<header className="bg-[#0F1A1F] border-b-2 border-gray-600 text-white shadow-md">
			<div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 min-h-[72px]">
				{/* Logo and Toggle */}
				<div className="flex items-center justify-between w-full md:w-auto">
					<Link to="/" className="flex items-center gap-2">
						{/* <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-lg flex items-center justify-center">
							<Flame className="w-6 h-6 text-white" />
						</div> */}
						<img src="/What the burn logo.jpg" alt="" className="w-10 h-10 rounded-md" />
						<h2 className="text-2xl font-bold bg-gradient-to-r from-[#02c74d] to-[#0de7ff] bg-clip-text text-transparent">
							What the Burn
						</h2>
					</Link>

					<button
						className="md:hidden text-gray-300 ml-auto"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</div>

				{/* Desktop Nav */}
				<div className="hidden md:flex items-center gap-4">
					{(isConnected && isAdmin) && (
						<Link
							to="/admin/dashboard"
							className="bg-[#50D2C1] text-gray-800 px-4 py-2 rounded-lg hover:text-white transition"
						>
							Admin Dashboard
						</Link>
					)}
					<ConnectButton />
				</div>
			</div>

			{/* Mobile Dropdown */}
			{mobileMenuOpen && (
				<div className="md:hidden px-4 pb-4">
					<div className="flex items-center sm:items-start flex-col space-y-3 rounded-lg bg-[#12242C] p-4 shadow-md">
						{(isConnected && isAdmin) && (
							<Link
								to="/admin/dashboard"
								className="bg-[#50D2C1] w-full text-gray-800 px-4 py-2 rounded-lg hover:text-white transition"
							>
								Admin Dashboard
							</Link>
						)}
						<ConnectButton />
					</div>
				</div>
			)}
		</header>
	);
}
