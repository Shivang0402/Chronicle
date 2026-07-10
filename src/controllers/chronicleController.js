const { response } = require("express");
const Chronicle = require("../models/chronicleModel"); // model

const createChronicle = async (req, res) => {
  const { title, date, content, mood, tags } = req.body;
  if (!content || content.trim() === "" || content.trim().length() < 10) {
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
  const { mood, tag, date } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 20);
  const skip = (page - 1) * limit;
  const filter = { user: req.user.id };
  const sortOption = { date: -1 };

  try {
    if (sortOption === "oldest") {
      sortOption.date = 1;
    }

    if (mood) {
      filter.mood = {
        $regex: mood,
        $options: "i",
      };
    }
    if (tag) {
      filter.tags = {
        $regex: tag,
        $options: "i",
      };
    }
    if (date) {
      filter.date = {
        $regex: date,
        $options: "i",
      };
    }

    const chronicles = await Chronicle.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalChronicles = await Chronicle.countDocuments(filter);

    const totalPages = Math.ceil(totalChronicles / limit);
    return res.status(200).json({
      page,
      limit,
      totalChronicles,
      totalPages,
      chronicles,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getChronicleById = async (req, res) => {
  const chronicleId = req.params.id;

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
    return res.status(500).json({ message: error.message });
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

const searchChronicle = async (req, res) => {
  const { query } = req.query;

  try {
    const chronicle = await Chronicle.find({
      user: req.user.id,
      $or: [
        {
          content: {
            $regex: query,
            $options: "i",
          },
        },
        {
          title: {
            $regex: query,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    }).sort({
      date: -1,
    });
    if (chronicle) {
      return res.status(200).json({
        chronicle,
      });
    } else {
      return res.status(404).json({
        message: "No chronicle with matching keyword found.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getChronicleStats = async (req, res) => {
  try {
    const totalChronicles = await Chronicle.countDocuments({
      user: req.user.id,
    });

    const chronicles = await Chronicle.find({
      user: req.user.id,
    });

    let totalWords = 0;
    for (const chronicle of chronicles) {
      totalWords += chronicle.content.trim().split(/\s+/).length;
    }
    const averageWords =
      totalChronicles === 0 ? 0 : Math.round(totalWords / totalChronicles);

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);
    const startYear = new Date(year, 0, 1);
    const endYear = new Date(year + 1, 0, 1);

    const entriesThisMonth = await Chronicle.countDocuments({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const entriesThisYear = await Chronicle.countDocuments({
      user: req.user.id,
      date: {
        $gte: startYear,
        $lt: endYear,
      },
    });

    const findchronicles = await Chronicle.find({
      user: req.user.id,
    });
    const moodCount = {};

    for (const chronicle of findchronicles) {
      const mood = chronicle.mood;

      if (moodCount[mood]) {
        moodCount[mood]++;
      } else {
        moodCount[mood] = 1;
      }
    }

    let highestCount = 0;
    let mostCommonMood = "";

    for (const mood in moodCount) {
      if (moodCount[mood] > highestCount) {
        highestCount = moodCount[mood];
        mostCommonMood = mood;
      }
    }

    return res.status(200).json({
      totalChronicles,
      totalWords,
      averageWords,
      entriesThisMonth,
      entriesThisYear,
      mostCommonMood,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createChronicle,
  getChronicles,
  getChronicleById,
  updateChronicleById,
  deleteChronicleById,
  searchChronicle,
  getChronicleStats,
};
