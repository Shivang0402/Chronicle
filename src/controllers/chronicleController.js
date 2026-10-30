const Chronicle = require("../models/chronicleModel"); // model

const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 100000;

const countWords = (content) => {
  const text = String(content || "").trim();
  return text ? text.split(/\s+/).length : 0;
};

const dayKey = (value) => {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

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

const getChronicles = async (req, res) => {
  const mood = typeof req.query.mood === "string" ? req.query.mood : "";
  const tag = typeof req.query.tag === "string" ? req.query.tag : "";
  const date = typeof req.query.date === "string" ? req.query.date : "";
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
      const start = new Date(date);

      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ message: "Invalid date filter" });
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

const getMoods = async (req, res) => {
  try {
    const entries = await Chronicle.find({ user: req.user.id }).select("mood");
    const counts = {};

    for (const { mood } of entries) {
      if (mood) counts[mood] = (counts[mood] || 0) + 1;
    }

    const moods = Object.entries(counts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json(moods);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTags = async (req, res) => {
  try {
    const entries = await Chronicle.find({ user: req.user.id }).select("tags");
    const counts = {};

    for (const { tags = [] } of entries) {
      for (const tag of tags) {
        if (tag) counts[tag] = (counts[tag] || 0) + 1;
      }
    }

    const tags = Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getChronicleStats = async (req, res) => {
  try {
    const chronicles = await Chronicle.find({
      user: req.user.id,
    }).sort({ date: 1 });
    const totalChronicles = chronicles.length;

    const totalWords = chronicles.reduce(
      (sum, chronicle) => sum + countWords(chronicle.content),
      0,
    );
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

    const oneDay = 24 * 60 * 60 * 1000;
    const toDayStart = (value) => {
      const day = new Date(value);
      return Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
    };

    const uniqueDates = [];

    for (const chronicle of chronicles) {
      const dayStart = toDayStart(chronicle.date);

      if (!uniqueDates.includes(dayStart)) {
        uniqueDates.push(dayStart);
      }
    }

    let currentStreak = uniqueDates.length > 0 ? 1 : 0;
    let longestStreak = currentStreak;

    for (let i = 1; i < uniqueDates.length; i++) {
      if (uniqueDates[i] - uniqueDates[i - 1] === oneDay) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
    }

    const todayStart = toDayStart(new Date());
    const lastDate = uniqueDates[uniqueDates.length - 1];

    if (
      uniqueDates.length === 0 ||
      (lastDate !== todayStart && lastDate !== todayStart - oneDay)
    ) {
      currentStreak = 0;
    }

    const range = req.query.range || "month";

    if (!["week", "month", "year", "all"].includes(range)) {
      return res.status(400).json({ message: "Invalid range" });
    }

    const now = new Date();
    let rangeStart = null;

    if (range === "week") {
      rangeStart = new Date(now);
      rangeStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      rangeStart.setHours(0, 0, 0, 0);
    } else if (range === "month") {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "year") {
      rangeStart = new Date(now.getFullYear(), 0, 1);
    }

    const ranged = rangeStart
      ? chronicles.filter((chronicle) => new Date(chronicle.date) >= rangeStart)
      : chronicles;

    const activity = {};
    const moodBreakdown = {};
    const trend = {};
    const monthly = range === "year" || range === "all";

    for (const chronicle of ranged) {
      const words = countWords(chronicle.content);
      const date = new Date(chronicle.date);
      const day = dayKey(date);
      const mood = (chronicle.mood || "").trim();

      activity[day] = activity[day] || { date: day, entries: 0, words: 0 };
      activity[day].entries += 1;
      activity[day].words += words;

      if (mood) moodBreakdown[mood] = (moodBreakdown[mood] || 0) + 1;

      let label = day;

      if (monthly) {
        label = day.slice(0, 7);
      } else {
        const start = new Date(date);
        start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        label = dayKey(start);
      }

      trend[label] = trend[label] || { label, entries: 0, words: 0 };
      trend[label].entries += 1;
      trend[label].words += words;
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
      range,
      rangeStart,
      activity: Object.values(activity).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
      moodBreakdown: Object.entries(moodBreakdown)
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count),
      trend: Object.values(trend).sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
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
  getMoods,
  getTags,
  getChronicleStats,
};
