import pool from '../config/db.js';

export const updateArtisanProfile = async (req, res) => {
  try {
    const artisanId = 1; // Hardcoded for now
    const { story, style } = req.body;

    await pool.query(
      "UPDATE artisans SET brand_profile = $1 WHERE id = $2",
      [{ story, style }, artisanId]
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};