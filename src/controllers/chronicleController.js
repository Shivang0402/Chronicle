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
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const createChronicle = async (req, res) => {
  const { title, date, content, mood, tags } = req.body;
  const validation = validateContent(content);

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  if (
    date !== undefined &&
    date !== null &&
    Number.isNaN(new Date(date).getTime())
  ) {
    return res.status(400).json({ message: "Invalid date" });
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    return res.status(400).json({ message: "Tags must be an array" });
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

const getChroniclesForUser = async (userId, query = {}) => {
  const mood = typeof query.mood === "string" ? query.mood : "";
  const tag = typeof query.tag === "string" ? query.tag : "";
  const date = typeof query.date === "string" ? query.date : "";
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 20);
  const skip = (page - 1) * limit;
  const filter = { user: userId };
  const sortOption = { date: query.sort === "oldest" ? 1 : -1 };

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
    const start = new Date(date);

    if (Number.isNaN(start.getTime())) {
      return { error: "Invalid date filter" };
    }

    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.date = { $gte: start, $lt: end };
  }

  const chronicles = await Chronicle.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const totalChronicles = await Chronicle.countDocuments(filter);

  const totalPages = Math.ceil(totalChronicles / limit);
  return {
    page,
    limit,
    totalChronicles,
    totalPages,
    chronicles,
  };
};

const getChronicles = async (req, res) => {
  try {
    const result = await getChroniclesForUser(req.user.id, req.query);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getChronicleById = async (req, res) => {
  const chronicleId = req.params.id;

  if (!isValidObjectId(chronicleId)) {
    return res.status(400).json({ message: "Invalid chronicle id" });
  }

  try {
    const chronicle = await Chronicle.findById(chronicleId);
    if (!chronicle) {
      return res.status(404).json({ message: "No such chronicle exists." });
    } else {
      if (chronicle.user.toString() === req.user.id) {
        return res.status(200).json({ chronicle });
      } else {
        return res.status(404).json({ message: "No such chronicle exists." });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateChronicleById = async (req, res) => {
  const chronicleId = req.params.id;

  if (!isValidObjectId(chronicleId)) {
    return res.status(400).json({ message: "Invalid chronicle id" });
  }

  try {
    const chronicle = await Chronicle.findById(chronicleId);
    if (!chronicle) {
      return res.status(404).json({ message: "No such chronicle exists." });
    }

    if (chronicle.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "No such chronicle exists." });
    }

    const { title, date, content, mood, tags } = req.body;
    const validation = content === undefined ? null : validateContent(content);

    if (validation && validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    if (
      date !== undefined &&
      date !== null &&
      Number.isNaN(new Date(date).getTime())
    ) {
      return res.status(400).json({ message: "Invalid date" });
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return res.status(400).json({ message: "Tags must be an array" });
    }

    if (title !== undefined) chronicle.title = title;
    if (date !== undefined) chronicle.date = date;
    if (content !== undefined) chronicle.content = validation.value;
    if (mood !== undefined) chronicle.mood = mood;
    if (tags !== undefined) chronicle.tags = tags;

    await chronicle.save();
    return res.status(200).json({
      message: "Chronicle updated successfully!",
      chronicle,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteChronicleById = async (req, res) => {
  const chronicleId = req.params.id;

  if (!isValidObjectId(chronicleId)) {
    return res.status(400).json({ message: "Invalid chronicle id" });
  }

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
        return res.status(404).json({ message: "No such chronicle exists." });
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

const getStatsForUser = async (userId) => {
  const chronicles = await Chronicle.find({
    user: userId,
  }).sort({ date: 1 });
    const totalChronicles = chronicles.length;

    let totalWords = 0;
    for (const chronicle of chronicles) {
      const content = (chronicle.content || "").trim();

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
      user: userId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const entriesThisYear = await Chronicle.countDocuments({
      user: userId,
      date: {
        $gte: startYear,
        $lt: endYear,
      },
    });

    const moodCount = {};

    for (const chronicle of chronicles) {
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

    let currentStreak = chronicles.length > 0 ? 1 : 0;
    let longestStreak = currentStreak;
    const oneDay = 24 * 60 * 60 * 1000;
    const uniqueDates = [];

    for (let i = 0; i < chronicles.length; i++) {
      const newDate = new Date(chronicles[i].date).setHours(0, 0, 0, 0);

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

  return {
    totalChronicles,
    totalWords,
    averageWords,
    entriesThisMonth,
    entriesThisYear,
    mostCommonMood,
    currentStreak,
    longestStreak,
  };
};

const getChronicleStats = async (req, res) => {
  try {
    const stats = await getStatsForUser(req.user.id);
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createChronicle,
  getChronicles,
  getChroniclesForUser,
  getChronicleById,
  updateChronicleById,
  deleteChronicleById,
  searchChronicle,
  getChronicleStats,
  getStatsForUser,
};
