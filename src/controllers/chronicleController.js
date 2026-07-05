const Chronicle = require("../models/chronicleModel");

const createChronicle = async (req, res) => {
  const { title, date, content, mood, tags } = req.body;
  if (!content) {
    return res.status(400).json({ message: "Content cannot be empty!" });
  }

  try {
    const newChronicle = new Chronicle({
      title,
      date,
      content,
      mood,
      tags,
      user: req.user.id,
    });

    await newChronicle.save();

    return res.status(200).json({
      message: "Chronicle created successfully",
      chronicle: newChronicle,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getChronicles = async (req, res) => {
  try {
    const Chronicles = await Chronicle.find({
      user: req.user.id,
    }).sort({
      date: -1,
    });
    if (Chronicles.length == 0) {
      return res.status(404).json({ message: "No chronicles created yet." });
    }
    return res.status(200).json({ Chronicles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getChronicleById = async (req, res) => {
  const chronicleId = req.params.id;
  console.log(chronicleId);

  try {
    const chronicle = await Chronicle.findById(chronicleId);
    if (!chronicle) {
      res.status(404).json({ message: "No such chronicle exists." });
    } else {
      if (chronicle.user.toString() == req.user.id) {
        res.status(200).json({ chronicle });
      } else {
        res.status(403).json({
          message: "You are not authorized to access this chronicle.",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: message.error });
  }
};

//

module.exports = { createChronicle, getChronicles, getChronicleById };
