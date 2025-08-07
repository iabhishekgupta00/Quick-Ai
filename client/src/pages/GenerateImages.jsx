import {Image, Sparkle } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL


const GenerateImages = () => {
    const imageStyle = [
        'Realistic','Impressionist','Contemporary','Minimalist','Surrealist'
    ,'Ghibli','Stylized','Cartoonish','Photo','Fantasy','Pixel Art',]

    const [selectedStyle,setSelectedStyle] = useState('Realistic')
    const [input,setInput] = useState("")
    const [publish,setPublish] = useState(false)
    const [loading,setLoading] = useState(false)
    const [content,setContent] = useState("")

    const {getToken} = useAuth()
    const onSubmitHandler =async (e)=>{
        e.preventDefault();
        try {
            setLoading(true)
            const prompt = `Generate images for ${input}. The images should be ${selectedStyle}`

            const{data} = await axios.post("/api/ai/generate-image",{
                prompt,publish
            },{
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
                    <Sparkle className='w-6 text-[#00ad25]'/>
                    <h1 className='text-xl font-semibold'>AI Image Generator</h1>
                </div>
                <p className='mt-6 text-sm font-medium'>Describe Your Image</p>
                <textarea onChange={(e)=>setInput(e.target.value)} value={input} rows={4} className='w-full p-2 px-3
                mt-2 outline-none text-sm rounded-md border border-gray-300' 
                placeholder='Describe your image and explain what you want to see...' required/>

                <p className='mt-4 text-sm font-medium'>Styles</p>
                <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
                    {imageStyle.map((item)=>(
                        <span onClick={()=>setSelectedStyle(item)} 
                        className={`text-xs px-4 py-2 rounded-full
                        border  cursor-pointer ${selectedStyle === item ? 
                            'bg-green-50 text-green-700' :'text-gray-500 border-gray-200'
                        }`} key={item}>{item}</span>
                    ))}
                </div>
                <div className='my-6 flex items-center gap-2'>
                    <label className='relative cursor-pointer'>
                        <input type="checkbox" className='sr-only peer' onChange={(e)=>setPublish(e.target.checked)}
                        checked={publish}/>
                        <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500
                        transition'></div>

                        <span className='absolute left-1 top-1 w-3 h-3
                        bg-white rounded-full peer-checked:translate-x-4
                        transition'></span>

                    </label>
                    <p className='text-sm'>Make this Publish</p>

                </div>
               
                <button disabled={loading} className='w-full flex justify-center items-center gap-2
                bg-gradient-to-r from-[#00ad25] to-[#04ff50] text-white
                px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
                 {loading ? <span className='w-4 h-4
                 my-1 rounded-full animate-spin border-2 border-t-transparent'></span> : <Image className='w-5'/>}
                    Generate Images
                </button>
            </form>

            {/* Right column */}

            <div className='w-[400px] max-w-lg p-4 bg-white rounded-lg
            flex flex-col border border-gray-200  min-h-126'>
                <div className='flex items-center gap-3'>
                <Image className='w-5 h-5 text-[#00ad25]'/>
                <h1 className='text-xl font-semibold'>Generated Images</h1>
                </div>

                {!content ? (<div className='flex-1 flex justify-center items-center'>
                    <div className='text-sm flex flex-col item-center gap-5
                    text-gray-600'>
                         <Image className='w-6 h-6'/>
                         <p>Generated Image according to your description</p>

                    </div>

                </div>):(
                    <div className='mt-3 h-full'>
                        <img src={content} alt="image"  className='w-full h-full'/>
                    </div>
                )}

            </div>
            
        </div>
    )
}

export default GenerateImages