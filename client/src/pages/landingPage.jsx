import React from 'react'
import { Link } from 'react-router-dom'

function LandingPage() {
    return (
        <div className='h-screen grid w-full bg-emerald-950'>LandingPage
            <Link className=' text-white' to="/burn">Dashboard</Link>;
        </div>
    )
}

export default LandingPage