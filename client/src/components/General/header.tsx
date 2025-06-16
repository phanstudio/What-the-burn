import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ConnectButton } from '@rainbow-me/rainbowkit';


export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className=' bg-[#0F1A1F] border-b-2 border-gray-600 text-white px-4 py-3 shadow-md'>
			<div className='max-w-7xl mx-auto flex items-center justify-between'>
				{/* Logo and Toggle */}
				<div className='flex items-center justify-between w-full md:w-auto'>
					<Link to={'/'}>
						<div className='flex items-center space-x-2'>
							<h1>what duh burn</h1>
							{/* <span className='text-xl font-bold'>Notty Terminal</span> */}
						</div>
						{/* <span className='text-2xl font-bold bg-gradient-to-r from-[#a4b9fa] to-[#4a0a80] bg-clip-text text-transparent'>
							Notty Terminal
							

						</span> */}
					</Link>
					{/* Mobile toggle */}
					<button
						className='md:hidden text-gray-300'
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						{mobileMenuOpen ? (
							<X className='w-6 h-6' />
						) : (
							<Menu className='w-6 h-6' />
						)}
					</button>
				</div>

				{/* Desktop Navigation links */}
				<div className="hidden md:flex">
					<ConnectButton />
				</div>


				{/* Right icons + button */}
			</div>

			{/* Mobile view dropdown nav */}
			{mobileMenuOpen && (
				<div className='md:hidden mt-4 flex flex-col items-start w-full max-w-xs bg-custom-dark-blue rounded-lg shadow-lg px-4 py-3 space-y-3'>
					{/* Navigation links dropdown */}
					<ConnectButton />
					{/* Icons and wallet button */}
					<div className='flex items-center gap-4 pt-2 border-t border-gray-700 w-full'>
						{/* <div className='relative'>
							<Bell className='w-5 h-5 text-gray-300 hover:text-white cursor-pointer' />
							<span className='absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500' />
						</div> */}

						{/* <MessageSquare className='w-5 h-5 text-gray-300 hover:text-white cursor-pointer' /> */}

					</div>
				</div>
			)}
		</header>
	);
}
