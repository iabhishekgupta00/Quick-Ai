import OpenAI from "openai";
import sql from "../configs/db.js";
import {clerkClient} from "@clerk/express"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()
import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import pdf from "pdf-parse/lib/pdf-parse.js"
import multer from "multer"

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});
export const generateArticle = async (req,res) => {
    try {
        const {userId} = req.auth()
        const {prompt , length} = req.body
        const plan = req.plan
        const free_usage = req.free_usage

        if(plan !== "premium" && free_usage >=10){
            return res.json({success: false, message: "You have no free usage left"})
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length,
        });
        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, 'article')`

        if(plan !== "premium"){
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetadata:{
                    free_usage: free_usage + 1
                }
            })
            
        }
        res.json({success: true, content})
        

        
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
    
}


export const generateBlogTitle = async (req,res) => {
    try {
        const {userId} = req.auth()
        const {prompt} = req.body
        const plan = req.plan
        const free_usage = req.free_usage

        if(plan !== "premium" && free_usage >=10){
            return res.json({success: false, message: "You have no free usage left"})
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{role: "user",content: prompt,}],
            temperature: 0.7,
            max_tokens: 100,
        });
        const content = response.choices[0].message.content

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${prompt}, ${content}, 'Blog Title')`

        if(plan !== "premium"){
            await clerkClient.users.updateUserMetadata(userId,{
                privateMetadata:{
                    free_usage: free_usage + 1
                }
            })
            
        }
        res.json({success: true, content})
        

        
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
    
}


export const generateImage = async (req,res) => {

    try {
        const {userId} = req.auth()
        const {prompt,publish} = req.body
        const plan = req.plan
        

        // Temporarily disabled premium check for testing
        if(false && plan !== "premium"){
            return res.json({success: false, message: "You need a premium plan to generate images"})
        }

        try {
            const formData = new FormData()
            formData.append('prompt',prompt)
            const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1",formData,{
                headers:{'x-api-key': process.env.CLIPDROP_API_KEY},
                responseType: 'arraybuffer'
                })

            const base64Image = `data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`
            const {secure_url} = await cloudinary.uploader.upload(base64Image)

            await sql`INSERT INTO creations (user_id, prompt, content, type,publish)
            VALUES (${userId}, ${prompt}, ${secure_url}, 'image',${publish ?? false})`

            res.json({success: true, content:secure_url})
            
        } catch (apiError) {
            console.log('ClipDrop API Error:', apiError.response?.status, apiError.message)
            
            // If it's a 402 error (payment required), provide a helpful message
            if (apiError.response?.status === 402) {
                return res.json({
                    success: false, 
                    message: "Image generation service requires payment. Please check your ClipDrop API subscription or try again later."
                })
            }
            
            // For other API errors, provide a generic message
            return res.json({
                success: false, 
                message: "Image generation service is currently unavailable. Please try again later."
            })
        }
        

        
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
    
}

export const removeBackgroundImage = async (req,res) => {
    try {
        const {userId} = req.auth()
        const image = req.file;
        const plan = req.plan
        

        // Temporarily disabled premium check for testing
        if(false && plan !== "premium"){
            return res.json({success: false, message: "You need a premium plan to generate images"})
        }

        const {secure_url} = await cloudinary.uploader.upload(image.path,{
            transformation:[{
                effect: "background_removal",
                background_image:"remove_the_background"
            }
            ]
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId}, ${"Remove Background"}, ${secure_url}, ${'image'})`

        
        res.json({success: true, content:secure_url})
        

        
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
    
}

export const removeObject = async (req,res) => {
    try {
        const {userId} = req.auth()
        const {object} = req.body;
        const image = req.file;
        const plan = req.plan
        

        // Temporarily disabled premium check for testing
        if(false && plan !== "premium"){
            return res.json({success: false, message: "You need a premium plan to generate images"})
        }

        const {public_id} = await cloudinary.uploader.upload(image)

        const imageUrl = cloudinary.url(public_id,{
            transformation:[{effect:`gen_remove:${object}`}],
            resource_type:'image'
                
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId},${`Remove ${object} from the image`}, ${imageUrl}, 'image')`

        
        res.json({success: true, content:imageUrl})
        

        
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
    
}

export const reviewResume = async (req,res) => {
    try {
        const {userId} = req.auth()
        const resume = req.file;
        const plan = req.plan
        

        // Temporarily disabled premium check for testing
        if(false && plan !== "premium"){
            return res.json({success: false, message: "You need a premium plan to generate images"})
        }

       if(resume.size > 5* 1024 * 1024){
        return res.json({success: false, message: "Resume size should be less than 5MB"})
       }

       const dataBuffer = fs.readFileSync(resume.path)
       const pdfData = await pdf(dataBuffer)

       const prompt = `Review this resume and provide feedback and provide the strength and weaknesses of the resume.
       ResumeContent:/n/n${pdfData.text}`

       const response = await AI.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [{role: "user",content: prompt,}],
        temperature: 0.7,
        max_tokens: 1000,
    });
    const content = response.choices[0].message.content
       
        await sql`INSERT INTO creations (user_id, prompt, content, type)
        VALUES (${userId},'Review the Resume', ${content}, 'review-resume')`

        
        res.json({success: true, content})
        

        
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
    
}