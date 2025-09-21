import pool from '../config/db.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory } from '../canister/src/declarations/canister_backend/canister_backend.did.js';

// Initialize with the standard Google AI SDK
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const canisterId = "uxrrr-q7777-77774-qaaaq-cai"; // Your Canister ID

// --- HELPER FUNCTIONS ---
const getCanister = async () => {
  // Use the public ngrok URL from your terminal
  const agent = new HttpAgent({ host: "https://30ea984be3df.ngrok-free.app" }); 

  // You do not need fetchRootKey() for the live canister or ngrok
  // await agent.fetchRootKey(); 

  return Actor.createActor(idlFactory, { 
    agent, 
    canisterId: "uxrrr-q7777-77774-qaaaq-cai" // Use your LOCAL canister ID
  });
};

// This function uses Gemini for analysis, creative writing, AND translation
async function generateAIContent(imageUrl, productName, targetLanguage, brandProfile, details, targetAudience) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const brandIdentity = `Artisan Story: ${brandProfile.story || 'A passionate creator.'}\nArtisan Style: ${brandProfile.style || 'Authentic.'}`;

  const prompt = `You are a world-class e-commerce marketing assistant for an artisan named '${details.artisanName}'. Their brand identity is: ${brandIdentity}. The brand voice MUST be consistent and personal.
  
  IMPORTANT: The target audience for this content is the '${targetAudience}'. You MUST tailor the tone, vocabulary, and cultural references in the story and description to appeal specifically to this group.
  
  For the product named "${productName}", analyze the provided image.
  
  Your task is to generate:
  1. A "story": A short, personal story from '${details.artisanName}'s perspective with a strong emotional hook, tailored for the target audience.
  2. A "description": A poetic and highly practical description, tailored for the target audience. Include: dimensions ('${details.dimensions}'), weight ('${details.approxWeight}'), care instructions ('${details.careInstructions}'), and uses ('${details.multiPurpose}').
  3. "hashtags": A valid JSON array of 12-15 relevant string hashtags.
  
  Return a valid JSON object where the top-level keys are "en" and "${targetLanguage}". Each key must contain an object with its own "description", "story", and "hashtags".`;

  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBase64 = Buffer.from(imageBuffer).toString("base64");

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
    const { productName, category, materials, targetLanguage, dimensions, useCases, careInstructions, artisanName, approxWeight, multiPurpose, targetAudience } = req.body;
    const imageUrl = req.file.path;
    const artisanId = 1;
    const profileResult = await pool.query("SELECT brand_profile FROM artisans WHERE id = $1", [artisanId]);
    const brandProfile = profileResult.rows[0]?.brand_profile || {};

    const aiContent = await generateAIContent(imageUrl, productName, targetLanguage, brandProfile, 
      { dimensions, useCases, careInstructions, approxWeight, multiPurpose, artisanName },
      targetAudience
    );

    const hashtags = aiContent.en.hashtags;
    const ai_story_en = aiContent.en.story;
    const canister = await getCanister();
    const blockchain_cert_id = (await canister.addRecord(ai_story_en)).toString();

    const newProduct = await pool.query(
      `INSERT INTO products (artisan_id, product_name, category, materials, image_url, ai_description, ai_story, blockchain_cert_id, hashtags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [artisanId, productName, category, materials, imageUrl, aiContent, aiContent, blockchain_cert_id, hashtags]
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
    const productResult = await pool.query("SELECT product_name, ai_story FROM products WHERE id = $1", [id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const story = productResult.rows[0].ai_story.en.story;
    const productName = productResult.rows[0].product_name;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a world-class social media strategist for an artisan. The product is "${productName}" and its story is: "${story}".
    Create a 3-day promotional plan for Instagram.

    For each day's caption, you MUST:
    1. Keep the caption concise and use line breaks for easy mobile reading.
    2. Use a storytelling element from the artisan's personal story.
    3. Include a UNIQUE and highly engaging call-to-action (CTA).
    4. Day 1: Suggest an interactive element like a poll and ask an open-ended question.
    5. Day 2: Ask a direct "this or that" question to spark comments.
    6. Day 3: Use scarcity and provide a crystal-clear CTA like "DM us to reserve yours or click the link in our bio."

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
    const { certId } = req.params;
    const recordIndex = BigInt(certId.split('-')[2]);

    const canister = await getCanister();
    const result = await canister.getRecord(recordIndex);
    
    const story_from_blockchain = result[0] || "Record not found."; 
    
    res.json({ story_from_blockchain });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { ai_description, ai_story } = req.body;
    
    await pool.query(
      "UPDATE products SET ai_description = $1, ai_story = $2 WHERE id = $3",
      [ai_description, ai_story, id]
    );
    
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const regenerateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { field, tone, originalContent } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a creative writing assistant. Rewrite the following text which is a product ${field}, to make it "${tone}". Return ONLY the rewritten text as a single string.
    
    Original Text: "${originalContent}"`;
    
    const result = await model.generateContent(prompt);
    const newText = result.response.text().trim();
    
    res.json({ newContent: newText });
  } catch (error) {
    console.error("Error regenerating content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getShowcaseByArtisan = async (req, res) => {
  try {
    const { artisanId } = req.params;
    const products = await pool.query(
      "SELECT id, product_name, image_url FROM products WHERE artisan_id = $1 ORDER BY created_at DESC", 
      [artisanId]
    );
    res.json(products.rows);
  } catch (error) {
    console.error("Error fetching showcase:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};