import pool from '../config/db.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from '../canister/src/declarations/canister_backend/canister_backend.did.js';

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const canisterId = "uxrrr-q7777-77774-qaaaq-cai"; // Your Canister ID

// --- HELPER FUNCTIONS ---

const getCanister = async () => {
  const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
  await agent.fetchRootKey(); // Required for local development
  return Actor.createActor(idlFactory, { agent, canisterId });
};

async function generateAIContent(imagePath, productName, targetLanguage) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const absoluteImagePath = path.join(process.cwd(), imagePath);
  const imageBuffer = await fs.readFile(absoluteImagePath);
  const imageBase64 = imageBuffer.toString("base64");

  const prompt = `You are a marketing expert for handmade crafts. For the product named "${productName}", analyze the provided image.
  Generate a compelling product description and a short, emotional story about the artisan's tradition.
  Return a valid JSON object with two top-level keys: "en" and "${targetLanguage}".
  Each key should contain an object with its own "description" and "story".`;

  const imagePart = {
    inlineData: { data: imageBase64, mimeType: "image/jpeg" },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(responseText);
}

// --- CONTROLLER EXPORTS ---

export const createProduct = async (req, res) => {
  try {
    const { productName, category, materials, targetLanguage } = req.body;
    const relativeImagePath = req.file.path;

    const aiContent = await generateAIContent(relativeImagePath, productName, targetLanguage);
    const ai_story_en = aiContent.en.story; // Use English story for the certificate

    const canister = await getCanister();
    const blockchain_cert_id = (await canister.addRecord(ai_story_en)).toString();

    const newProduct = await pool.query(
      `INSERT INTO products (artisan_id, product_name, category, materials, image_url, ai_description, ai_story, blockchain_cert_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [1, productName, category, materials, relativeImagePath, aiContent, aiContent, blockchain_cert_id]
    );

    res.status(201).json({ product: newProduct.rows[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product.rows[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const generateSocialPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const productResult = await pool.query("SELECT ai_story FROM products WHERE id = $1", [id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const story = productResult.rows[0].ai_story.en.story; // Use English story

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a social media marketing expert for artisans. Based on this product story: "${story}", create a simple 3-day promotional plan for Instagram. Suggest a post type (e.g., Image, Reel) and a compelling caption for each day. Return a valid JSON array of objects, where each object has "day", "post_type", and "caption" keys.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    const plan = JSON.parse(responseText);
    res.json(plan);
  } catch (error) {
    console.error("Error generating social plan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { certId } = req.params; // e.g., "ART-CERT-1"
    const recordIndex = BigInt(certId.split('-')[2]);

    const canister = await getCanister();
    const result = await canister.getRecord(recordIndex);
    
    // The result from the canister might be wrapped in an array or optional type
    const story_from_blockchain = result[0] || "Record not found."; 
    
    res.json({ story_from_blockchain });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};