import { Scissors, Sparkle } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
const RemoveObject = () => {
    const [input,setInput] = useState("")
    const [object,setObject] = useState("")
    const [loading,setLoading] = useState(false)
    const [content,setContent] = useState("")
    
    const {getToken} = useAuth()
    const onSubmitHandler =async (e)=>{
        e.preventDefault();
        try {
            setLoading(true)
            if(object.split(" ").length > 1){
                return toast.error("Only one object at a time")
            }
            const formData = new FormData()
            formData.append('image',input)
            formData.append('object',object)

            const{data} = await axios.post("/api/ai/remove-object",formData,{
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
                    <Sparkle className='w-6 text-[#4a7aff]'/>
                    <h1 className='text-xl font-semibold'>Object Remover</h1>
                </div>
                <p className='mt-6 text-sm font-medium'>Upload Image</p>
                <input onChange={(e)=>setInput(e.target.files[0])} type="file" accept='image/*' 
                 className='w-full p-2 px-3
                mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' 
                required/>

                <p className='mt-6 text-sm font-medium'>Object to Remove</p>
                <textarea onChange={(e)=>setObject(e.target.value)} value={object} rows={4} className='w-full p-2 px-3
                mt-2 outline-none text-sm rounded-md border border-gray-300' 
                placeholder='only one object at a time' required/>

                <button disabled={loading} className='w-full flex justify-center items-center gap-2
                bg-gradient-to-r from-[#417df6] to-[#00ad25] text-white
                px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
                    {loading ? <span className='w-4 h-4 my-1 rounded-full animate-spin border-2 border-t-transparent'></span> :<Scissors className='w-5'/>}
                    Remove Object
                </button>
            </form>

            {/* Right column */}

            <div className='w-[400px] max-w-lg p-4 bg-white rounded-lg
            flex flex-col border border-gray-200  min-h-126'>
                <div className='flex items-center gap-3'>
                <Scissors className='w-5 h-5 text-[#4a7aff]'/>
                <h1 className='text-xl font-semibold'>Generated Image</h1>
                </div>

                {!content ? (<div className='flex-1 flex justify-center items-center'>
                    <div className='text-sm flex flex-col item-center gap-5
                    text-gray-600'>
                         <Scissors className='w-6 h-6'/>
                         <p>Generated Image without object</p>

                    </div>

                </div>) : (
                    <img src={content} alt="image"  className='mt-3 w-full h-full'/>
                )}

            </div>
            
        </div>
    )
}

export default RemoveObject