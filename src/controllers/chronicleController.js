const Chronicle = require("../models/chronicleModel"); // model

const createChronicle = async (req, res) => {
  const { title, date, content, mood, tags } = req.body;
  if (!content || content.trim() === "" || content.length() < 10) {
    return res
      .status(400)
      .json({ message: "Content must be of atleast 10 charcaters" });
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
      return res.status(404).json({ message: "No such chronicle exists." });
    } else {
      if (chronicle.user.toString() === req.user.id) {
        res.status(200).json({ chronicle });
      } else {
        return res.status(403).json({
          message: "You are not authorized to access this chronicle.",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: message.error });
  }
};

const updateChronicleById = async (req, res) => {
  const chronicleId = req.params.id;

  try {
    const chronicle = await Chronicle.findById(chronicleId);
    if (!chronicle) {
      return res.status(404).json({ message: "No such chronicle exists." });
    } else {
      if (chronicle.user.toString() === req.user.id) {
        const { title, date, content, mood, tags } = req.body;

        chronicle.title = title;
        chronicle.date = date;
        chronicle.content = content;
        chronicle.mood = mood;
        chronicle.tags = tags;

        if (!content || content.trim() === "" || content.length() < 10) {
          return res
            .status(400)
            .json({ message: "Content must be of atleast 10 charcaters" });
        } else {
          await chronicle.save();
          return res.status(200).json({
            message: "Chronicle updated successfully! \n",
            chronicle,
          });
        }
      } else {
        return res.status(403).json({
          message: "You are not authorized to access this chronicle.",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteChronicleById = async (req, res) => {
  const chronicleId = req.params.id;

  try {
    const chronicle = await Chronicle.findById(chronicleId);
    if (!chronicle) {
      return res.status(404).json({ message: "No such chronicle exists." });
    } else {
      if (chronicle.user.toString() === req.user.id) {
        await Chronicle.findByIdAndDelete(chronicleId);
        return res.status(200).json({
          message: "Chronicle deleted successfully",
        });
      } else {
        return res.status(403).json({
          message: "You are not authorized to access this chronicle.",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createChronicle,
  getChronicles,
  getChronicleById,
  updateChronicleById,
  deleteChronicleById,
};
