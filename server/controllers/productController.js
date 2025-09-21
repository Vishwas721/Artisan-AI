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

// --- UPDATE createProduct function ---
export const createProduct = async (req, res) => {
  try {
    const { productName, category, materials, targetLanguage, dimensions, useCases, careInstructions, artisanName } = req.body;
    const relativeImagePath = req.file.path;

    const artisanId = 1;
    const profileResult = await pool.query("SELECT brand_profile FROM artisans WHERE id = $1", [artisanId]);
    const brandProfile = profileResult.rows[0]?.brand_profile || {};

    const aiContent = await generateAIContent(relativeImagePath, productName, targetLanguage, brandProfile, 
      { dimensions, useCases, careInstructions, artisanName }
    );

    // --- NEW: Get hashtags from the AI response (using English version for consistency) ---
    const hashtags = aiContent.en.hashtags; 
    
    const ai_story_en = aiContent.en.story;
    const canister = await getCanister();
    const blockchain_cert_id = (await canister.addRecord(ai_story_en)).toString();

    // --- UPDATED: Add 'hashtags' and the '$9' placeholder to the INSERT query ---
    const newProduct = await pool.query(
      `INSERT INTO products (artisan_id, product_name, category, materials, image_url, ai_description, ai_story, blockchain_cert_id, hashtags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [artisanId, productName, category, materials, relativeImagePath, aiContent, aiContent, blockchain_cert_id, hashtags] // Add 'hashtags' here
    );

    res.status(201).json({ product: newProduct.rows[0] });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function generateAIContent(imagePath, productName, targetLanguage, brandProfile, details) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const brandIdentity = `
    Artisan Story: ${brandProfile.story || 'A passionate creator of handmade goods.'}
    Artisan Style: ${brandProfile.style || 'Authentic and high-quality.'}
  `;

  const prompt = `You are a world-class marketing assistant for an artisan named '${details.artisanName}'. Their brand identity is: ${brandIdentity}. All content MUST be cohesive and reflect this style.
  
  For the product named "${productName}", analyze the provided image.
  
  Your task is to generate:
  1. A "story": Write a short, personal story from the perspective of '${details.artisanName}'. Start with a strong, one-sentence emotional hook that grabs attention.
  2. A "description": Be poetic and practical. Weave in these details: Dimensions are '${details.dimensions}', ideal use cases are '${details.useCases}', and specific care instructions are '${details.careInstructions}'.
  3. "hashtags": Provide 7-9 relevant hashtags, mixing broad, niche, location (#madeinindia), and style tags (#bohochic).
  
  Return a valid JSON object where the top-level keys are "en" and "${targetLanguage}". Each of these keys must contain an object with its own "description", "story", and "hashtags".`;
  const absoluteImagePath = path.join(process.cwd(), imagePath);
  const imageBuffer = await fs.readFile(absoluteImagePath);
  const imageBase64 = imageBuffer.toString("base64");
  const imagePart = { inlineData: { data: imageBase64, mimeType: "image/jpeg" }};
  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(responseText);
}

// --- CONTROLLER EXPORTS ---



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
    const productName = productResult.rows[0].product_name;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a social media marketing expert for an artisan. The product is "${productName}" and its story is: "${story}".
    Create a 3-day promotional plan for Instagram.

    For each day's caption, you MUST:
    1.  Use a storytelling element.
    2.  Include a DIFFERENT and VARIED call-to-action (CTA) to drive engagement. On Day 1, ask a question. On Day 2, ask to "Tag a friend". On Day 3, use urgency and a direct shop link.
    3.  Include relevant hashtags.

    Return a valid JSON array of objects, where each object has "day", "post_type", and "caption" keys.`;
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