import { FileText, Sparkle } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const ReviewResume = () => {
    const [input,setInput] = useState("")
    const [loading,setLoading] = useState(false)
    const [content,setContent] = useState("")
    
    const {getToken} = useAuth()
    const onSubmitHandler =async (e)=>{
        e.preventDefault();
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('resume',input)

            const{data} = await axios.post("/api/ai/review-resume",formData,{
                headers:{
                    Authorization: `Bearer ${await getToken()}`
                }
            })
            if(data.success){
                setContent(data.content)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }
    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4
        text-slate-700' >
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg
            border border-gray-200'>
                <div className='flex items-center gap-4'>
                    <Sparkle className='w-6 text-[#00da83]'/>
                    <h1 className='text-xl font-semibold'>Resume Review</h1>
                </div>
                <p className='mt-6 text-sm font-medium'>Upload Resume</p>
                <input onChange={(e)=>setInput(e.target.files[0])} type="file" accept='application/pdf' 
                 className='w-full p-2 px-3
                mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' 
                required/>

                <p className='text-xs text-gray-500 font-light mt-1'>Supports: .pdf format only</p>

                <button disabled={loading} className='w-full flex justify-center items-center gap-2
                bg-gradient-to-r from-[#00da83] to-[#009bb3] text-white
                px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
                    {loading ? <span className='w-4 h-4 my-1 rounded-full animate-spin border-2 border-t-transparent'></span> :<FileText className='w-5'/>}
                    Review Resume
                </button>
            </form>

            {/* Right column */}

            <div className='w-[400px] max-w-lg p-4 bg-white rounded-lg
            flex flex-col border border-gray-200  min-h-86 max-h-[600px]'>
                <div className='flex items-center gap-3'>
                <FileText className='w-5 h-5 text-[#00da83]'/>
                <h1 className='text-xl font-semibold'>Analysis Results</h1>
                </div>

                {!content ? (<div className='flex-1 flex justify-center items-center'>
                    <div className='text-sm flex flex-col item-center gap-5
                    text-gray-600'>
                         <FileText className='w-6 h-6'/>
                         <p>Resume Analysis</p>

                    </div>

                </div>) : (
                    <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
                        <div className='reset_tw'>
                            <Markdown>{content}</Markdown>
                        </div>
                        
                    </div> 
                )}

            </div>
            
        </div>
    )
}

export default ReviewResume
