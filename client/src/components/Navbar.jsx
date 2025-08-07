import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

const NavBar = () => {
    const navigate = useNavigate()
    const { user } = useUser();
    const {openSignIn} = useClerk()
    return (
        <div className='fixed z-5 w-full backdrop-blur-2xl flex items-center justify-between px-4
        py-3 sm:px-20 xl:px-32'>
            <img src={assets.logo} alt="logo" className='w-32 sm:w-44' onClick={() => navigate("/")} />
            <div className='flex items-center gap-5'>
                {user ? <UserButton/>:
                (
                <button className='flex items-center gap-2 cursor-pointer bg-primary text-white px-10 py-2.5 rounded-full'>
                    Get Started <ArrowRight className='w-4 h-4' onClick={openSignIn}/>
                </button>)}
            </div>

            
        </div>
    )
}

export default NavBar
