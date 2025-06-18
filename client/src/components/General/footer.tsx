export default function NottyTerminalFooter() {
	return (
		<div className='bg-[#0F1A1F] border-t-2 border-gray-600 text-white py-8 px-4'>
			<div className='container mx-auto'>
				<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-16 pl-24 pr-24'>
					<div className='mb-4 md:mb-0'>
						<h2 className='text-2xl font-bold bg-gradient-to-r from-[#02c74d] to-[#0de7ff] bg-clip-text text-transparent'>
							What the Burn
						</h2>

					</div>

					<nav className='flex flex-wrap gap-4 md:gap-8 text-sm'>
						<a href='#' className='text-gray-400 hover:text-white transition'>
							Terms
						</a>
						<a href='#' className='text-gray-400 hover:text-white transition'>
							Privacy
						</a>
						<a href='#' className='text-gray-400 hover:text-white transition'>
							Docs
						</a>
						<a href='#' className='text-gray-400 hover:text-white transition'>
							Contact
						</a>
					</nav>
				</div>

				<div className='text-center text-gray-400 text-sm'>
					© 2025 What the burn. All rights reserved.
				</div>
			</div>
		</div>
	);
}
