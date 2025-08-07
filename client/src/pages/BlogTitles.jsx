import React from 'react'
import { Hash, Sparkle } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL


const BlogTitles = () => {
    const blogCategories = [
        'General','Business','Health','Technology','Entertainment','Sports','Travel','Food',
        'Education','Fashion','Lifestyle','Music','Movies','News']

    const [selectedCategory,setSelectedCategory] = useState("General")
    const [input,setInput] = useState("")
    const [loading,setLoading] = useState(false)
    const [content,setContent] = useState("")

    const {getToken} = useAuth()
    const onSubmitHandler =async (e)=>{
        e.preventDefault();
        try {
            setLoading(true)
            const prompt = `Write blog titles on ${input}. The blog titles should be ${selectedCategory}`

            const{data} = await axios.post("/api/ai/generate-blog-titles",{
                prompt,
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
        }catch (error) {
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
                    <Sparkle className='w-6 text-[#8e37eb]'/>
                    <h1 className='text-xl font-semibold'>AI Blog Title Generator</h1>
                </div>
                <p className='mt-6 text-sm font-medium'>Keyword</p>
                <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3
                mt-2 outline-none text-sm rounded-md border border-gray-300' 
                placeholder='Enter keyword' required/>

                <p className='mt-4 text-sm font-medium'>Category</p>
                <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
                    {blogCategories.map((item)=>(
                        <span onClick={()=>setSelectedCategory(item)} 
                        className={`text-xs px-4 py-2 rounded-full
                        border  cursor-pointer ${selectedCategory === item ? 
                            'bg-purple-50 text-purple-700' :'text-gray-500 border-gray-200'
                        }`} key={item}>{item}</span>
                    ))}
                </div>
                <br/>
                <button disabled={loading} className='w-full flex justify-center items-center gap-2
                bg-gradient-to-r from-[#c341f6] to-[#8e37eb] text-white
                px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
                    {loading ? <span className='w-4 h-4
                    my-1 rounded-full animate-spin border-2 border-t-transparent'></span> :<Hash className='w-5'/>}
                    Generate Titles
                </button>
            </form>

            {/* Right column */}

            <div className='w-[400px] max-w-lg p-4 bg-white rounded-lg
            flex flex-col border border-gray-200  min-h-126'>
                <div className='flex items-center gap-3'>
                <Hash className='w-5 h-5 text-[#8e37eb]'/>
                <h1 className='text-xl font-semibold'>Generated Titles</h1>
                </div>

               {!content ?  (<div className='flex-1 flex justify-center items-center'>
                    <div className='text-sm flex flex-col item-center gap-5
                    text-gray-600'>
                         <Hash className='w-6 h-6'/>
                         <p>Generated blog Title</p>

                    </div>

                </div>) : (  
                    <div className='mr-3 h-full overflow-y-scroll text-sm text-slate-600'>
                        <div className='reset-tw'>
                            <Markdown>{content}</Markdown></div>                      
                        </div>)}

            </div>
            
        </div>
    )
}

export default BlogTitles
