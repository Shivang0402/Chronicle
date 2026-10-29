const Chronicle = require("../models/chronicleModel"); // model

const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 100000;

const validateContent = (content) => {
  if (content === undefined || content === null) {
    return { error: "Content is required" };
  }

  const value = String(content).trim();

  if (value.length < MIN_CONTENT_LENGTH) {
    return {
      error: `Content must be at least ${MIN_CONTENT_LENGTH} characters`,
    };
  }

  if (value.length > MAX_CONTENT_LENGTH) {
    return {
      error: `Content must be at most ${MAX_CONTENT_LENGTH} characters`,
    };
  }

  return { value };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createChronicle = async (req, res) => {
  const { title, date, content, mood, tags } = req.body;
  const validation = validateContent(content);

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  try {
    const newChronicle = new Chronicle({
      title,
      date,
      content: validation.value,
      mood,
      tags,
      user: req.user.id,
    });

    await newChronicle.save();

    return res.status(201).json({
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
  const sortOption = { date: req.query.sort === "oldest" ? 1 : -1 };

  try {
    if (mood) {
      filter.mood = {
        $regex: escapeRegex(mood),
        $options: "i",
      };
    }
    if (tag) {
      filter.tags = {
        $regex: escapeRegex(tag),
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
        return res.status(200).json({ chronicle });
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
        const validation = validateContent(content);

        if (validation.error) {
          return res.status(400).json({ message: validation.error });
        }

        chronicle.title = title;
        chronicle.date = date;
        chronicle.content = validation.value;
        chronicle.mood = mood;
        chronicle.tags = tags;

        await chronicle.save();
        return res.status(200).json({
          message: "Chronicle updated successfully! \n",
          chronicle,
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

  if (typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const chronicle = await Chronicle.find({
      user: req.user.id,
      $or: [
        {
          content: {
            $regex: escapeRegex(query.trim()),
            $options: "i",
          },
        },
        {
          title: {
            $regex: escapeRegex(query.trim()),
            $options: "i",
          },
        },
        {
          tags: {
            $regex: escapeRegex(query.trim()),
            $options: "i",
          },
        },
      ],
    }).sort({
      date: -1,
    });
    if (chronicle.length === 0) {
      return res.status(404).json({
        message: "No chronicle with matching keyword found.",
      });
    }

    return res.status(200).json({
      chronicle,
    });
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
      const content = chronicle.content.trim();

      if (!content) {
        continue;
      }

      totalWords += content.split(/\s+/).length;
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
      const mood = (chronicle.mood || "").trim();

      if (!mood) {
        continue;
      }

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

    const chronicle = await Chronicle.find({
      user: req.user.id,
    }).sort({ date: 1 });

    let currentStreak = chronicle.length > 0 ? 1 : 0;
    let longestStreak = currentStreak;
    const oneDay = 24 * 60 * 60 * 1000;
    const uniqueDates = [];

    for (let i = 0; i < chronicle.length; i++) {
      const newDate = new Date(chronicle[i].date).setHours(0, 0, 0, 0);

      if (!uniqueDates.includes(newDate)) {
        uniqueDates.push(newDate);
      }
    }

    for (let i = 1; i < uniqueDates.length; i++) {
      const difference = uniqueDates[i] - uniqueDates[i - 1];

      if (difference === oneDay) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(currentStreak, longestStreak);
    }

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const lastDate = uniqueDates[uniqueDates.length - 1];

    if (lastDate !== todayStart && lastDate !== todayStart - oneDay) {
      currentStreak = 0;
    }

    return res.status(200).json({
      totalChronicles,
      totalWords,
      averageWords,
      entriesThisMonth,
      entriesThisYear,
      mostCommonMood,
      currentStreak,
      longestStreak,
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
