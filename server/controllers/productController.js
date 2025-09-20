import pool from '../config/db.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from '../canister/src/declarations/canister_backend/canister_backend.did.js';

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Your Canister ID
const canisterId = "uxrrr-q7777-77774-qaaaq-cai";

// Function to create blockchain certificate
export const createBlockchainCertificate = async (story) => {
  const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
  await agent.fetchRootKey(); // Required for local development

  const canister = Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });

  // Call the 'addRecord' function from your Motoko canister
const certificateId = await canister.addRecord(story); // Correct// Correct for testing
  return certificateId.toString();
};

// Function to generate AI content from image and product name
async function generateAIContent(imagePath, productName) {
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Correct

  // Read image file using absolute path
  const absoluteImagePath = path.join(process.cwd(), imagePath);
  const imageBuffer = await fs.readFile(absoluteImagePath);
  const imageBase64 = imageBuffer.toString("base64");

  const prompt = `You are a marketing expert for handmade crafts. For the product named "${productName}", analyze the provided image and generate a compelling product description and a short, emotional story about the artisan's tradition. Return the response as a JSON object with two keys: "description" and "story".`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: "image/jpeg", // adjust if using PNG
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text();

  // Clean the response to make it valid JSON
  const cleanedJsonString = responseText.replace(/```json|```/g, "").trim();
  
  let aiContent;
  try {
    aiContent = JSON.parse(cleanedJsonString);
  } catch (err) {
    console.error("Failed to parse AI response:", cleanedJsonString);
    throw new Error("AI response parsing error");
  }

  return aiContent;
}

// Main function to create product
export const createProduct = async (req, res) => {
  try {
    // 1. Get input
    const { productName, category, materials } = req.body;
    const relativeImagePath = req.file.path; // e.g., 'uploads/filename.jpg'

    // 2. Generate AI content
    const aiContent = await generateAIContent(relativeImagePath, productName);
    const ai_description = aiContent.description;
    const ai_story = aiContent.story;

    // 3. Create blockchain certificate
    const blockchain_cert_id = await createBlockchainCertificate(ai_story);

    // 4. Save everything to the database
    const newProduct = await pool.query(
      `INSERT INTO products 
        (artisan_id, product_name, category, materials, image_url, ai_description, ai_story, blockchain_cert_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [1, productName, category, materials, relativeImagePath, ai_description, ai_story, blockchain_cert_id]
    );

    // 5. Send response
    res.status(201).json({
      product: newProduct.rows[0],
      aiContent,
      blockchain_cert_id
    });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
