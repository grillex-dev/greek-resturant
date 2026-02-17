import prisma from "../../config/prisma.js";

export const getHome = async (req, res) => {
  try {
    res.send("home");
  } catch (error) {
    res.status(500).json({ message: "Failed to get home" });
  }
};
