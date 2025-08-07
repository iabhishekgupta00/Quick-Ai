import React, { useState } from 'react'
import { Edit, Sparkle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import Markdown from 'react-markdown'


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
const WriteArticle = () => {

    const articleLength = [
        {length:800,text:"Short (500-800 words)"},
        {length:1200,text:"Medium (800-1200 words)"},
        {length:1600,text:"Long (1200+ words)"}
    ]

    const [selectedLength,setSelectedLength] = useState(articleLength[0])
    const [input,setInput] = useState("")
    const [loading,setLoading] = useState(false)
    const [content,setContent] = useState("")

    const {getToken} = useAuth()
    const onSubmitHandler =async (e)=>{
        e.preventDefault();
        try {
            setLoading(true)
            const prompt = `Write an article on ${input}. The article should be ${selectedLength.text}`

            const token = await getToken()
            const {data} = await axios.post("/api/ai/generate-article",{
                prompt,
                length:selectedLength.length
            },{
                headers:{
                    Authorization: `Bearer ${token}`
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
                    <Sparkle className='w-6 text-[#4A7AFF]'/>
                    <h1 className='text-xl font-semibold'>Article Configuration</h1>
                </div>
                <p className='mt-6 text-sm font-medium'>Article Topic</p>
                <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3
                mt-2 outline-none text-sm rounded-md border border-gray-300' 
                placeholder='Enter article topic' required/>

                <p className='mt-4 text-sm font-medium'>Article Length</p>
                <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
                    {articleLength.map((item,index)=>(
                        <span onClick={()=>setSelectedLength(item)} 
                        className={`text-xs px-4 py-2 rounded-full
                        border  cursor-pointer ${selectedLength.text === item.text ? 
                            'bg-blue-50 text-blue-700' :'text-gray-500 border-gray-200'
                        }`} key={index}>{item.text}</span>
                    ))}
                </div>
                <br/>
                <button className='w-full flex justify-center items-center gap-2
                bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white
                px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer' disabled={loading}>
                    {loading ? <span className='w-4 h-4
                    my-1 rounded-full animate-spin border-2 border-t-transparent'></span> :<Edit className='w-5'/>}
                    Generate Article
                </button>
            </form>

            {/* Right column */}

            <div className='w-[400px] max-w-lg p-4 bg-white rounded-lg
            flex flex-col border border-gray-200  min-h-126 max-h-[600px]'>
                <div className='flex items-center gap-3'>
                <Edit className='w-5 h-5 text-[#4A7AFF]'/>
                <h1 className='text-xl font-semibold'>Generated Article</h1>
                </div>

              {!content ?( <div className='flex-1 flex justify-center items-center'>
                    <div className='text-sm flex flex-col item-center gap-5
                    text-gray-600'>
                         <Edit className='w-9 h-9 '/>
                         <p>Article Title</p>

                    </div>

                </div>
                ) :(
                    <div className='mr-3 h-full overflow-y-scroll text-sm text-slate-600'>
                       <div className='reset-tw'>
                        <Markdown>{content}</Markdown></div>                      
                    </div>
                )}

            </div>
            
        </div>
    )
}

export default WriteArticle
