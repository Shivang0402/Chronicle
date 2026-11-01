const puppeteer = require("puppeteer");
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

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const moodTone = (mood) => {
  const value = String(mood || "").toLowerCase();
  if (/peace|calm|content|grounded/.test(value)) return "sage";
  if (/grateful|joy|happy|hope/.test(value)) return "gold";
  if (/inspir|curious|excited/.test(value)) return "clay";
  if (/sad|low|tired|anxious|angry/.test(value)) return "blue";
  return "sage";
};

const moodEmoji = (mood) => {
  const value = String(mood || "").toLowerCase();
  if (/peace|calm|content|grounded/.test(value)) return "🌿";
  if (/grateful|joy|happy|hope/.test(value)) return "✨";
  if (/inspir|curious|excited/.test(value)) return "✍️";
  if (/sad|low|tired/.test(value)) return "☁️";
  if (/anxious|angry|tense/.test(value)) return "〰️";
  if (/contemplative|reflective/.test(value)) return "☾";
  return "✦";
};

const buildEntryHtml = (entry, index) => {
  const heading = new Date(entry.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const tags = (entry.tags || [])
    .filter(Boolean)
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("");

  return `<article class="entry">
    <div class="entry-heading">
      <div class="entry-date"><span class="entry-number">${String(index + 1).padStart(2, "0")}</span><time>${escapeHtml(heading)}</time></div>
      ${entry.mood ? `<span class="mood mood-${moodTone(entry.mood)}"><span class="emoji">${moodEmoji(entry.mood)}</span>${escapeHtml(entry.mood)}</span>` : ""}
    </div>
    <h2 class="title">${escapeHtml(entry.title || "Untitled entry")}</h2>
    ${tags ? `<div class="tags">${tags}</div>` : ""}
    <p class="content">${escapeHtml(entry.content)}</p>
  </article>`;
};

const buildPdf = async (entries, exportedOn) => {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="light">
<style>
  :root { --ivory: #f8f7f3; --paper: #fdfcf9; --ink: #252622; --muted: #66685f; --sage: #50614b; --sage-pale: #e8efe6; --hairline: #e5e3dc; }
  * { box-sizing: border-box; }
  @page { size: A4; margin: 24mm 18mm 22mm; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: Georgia, "Times New Roman", "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", serif; line-height: 1.7; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cover { min-height: 246mm; padding: 18mm 12mm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; background: radial-gradient(circle at 88% 12%, #e8efe6 0, #e8efe6 18%, transparent 18.2%), linear-gradient(145deg, #fdfcf9 0%, #f8f7f3 72%, #f0eee7 100%); position: relative; overflow: hidden; }
  .cover::after { content: ""; position: absolute; right: -30mm; bottom: 12mm; width: 95mm; height: 95mm; border: 1px solid rgba(80,97,75,.2); border-radius: 50%; box-shadow: 0 0 0 12mm rgba(80,97,75,.035), 0 0 0 24mm rgba(80,97,75,.025); }
  .brand { color: var(--sage); font: 600 9pt Arial, sans-serif; letter-spacing: .28em; text-transform: uppercase; }
  .cover-copy { position: relative; z-index: 1; margin-top: 24mm; }
  .kicker { color: var(--sage); font: 600 8pt Arial, sans-serif; letter-spacing: .22em; text-transform: uppercase; }
  h1 { max-width: 145mm; margin: 8mm 0 5mm; font-size: 40pt; font-weight: 400; line-height: 1.12; letter-spacing: -.035em; }
  .cover-deck { max-width: 110mm; color: var(--muted); font-size: 13pt; line-height: 1.7; }
  .cover-note { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 12mm; border-top: 1px solid rgba(80,97,75,.3); padding-top: 5mm; color: var(--muted); font: 8pt Arial, sans-serif; letter-spacing: .08em; text-transform: uppercase; }
  .contents-head { margin: 0 0 8mm; padding-bottom: 5mm; border-bottom: 1px solid var(--hairline); }
  .contents-head .kicker { display: block; margin-bottom: 2mm; }
  .contents-head h2 { margin: 0; font-size: 23pt; font-weight: 400; }
  .entry { padding: 7mm 0 8mm; border-bottom: 1px solid var(--hairline); break-inside: auto; }
  .entry-heading { display: flex; align-items: center; justify-content: space-between; gap: 8mm; margin-bottom: 3mm; break-after: avoid; }
  .entry-date { display: flex; align-items: center; gap: 3mm; color: var(--sage); font: 600 8pt Arial, sans-serif; letter-spacing: .08em; }
  .entry-number { color: #9ba995; font: italic 11pt Georgia, serif; }
  .mood { border-radius: 99px; padding: 1.5mm 3mm; font: 600 7.5pt Arial, sans-serif; }
  .emoji { margin-right: 1.5mm; font-family: "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif; }
  .mood-sage { background: var(--sage-pale); color: #40513b; }
  .mood-gold { background: #f4ecd9; color: #806331; }
  .mood-clay { background: #f4e5dc; color: #915e43; }
  .mood-blue { background: #e5edf0; color: #4c6873; }
  .title { margin: 0 0 2mm; color: var(--ink); font-size: 21pt; font-weight: 400; line-height: 1.28; break-after: avoid; }
  .tags { display: flex; flex-wrap: wrap; gap: 2mm; margin-bottom: 4mm; break-after: avoid; }
  .tag { color: var(--sage); background: #f1f3ee; border-radius: 2px; padding: 1mm 2mm; font: 7pt Arial, sans-serif; }
  .content { margin: 0; color: #41433d; font-size: 11pt; line-height: 1.85; white-space: pre-wrap; overflow-wrap: anywhere; }
  .empty { margin-top: 12mm; border-left: 2px solid #a6b19f; padding: 4mm 5mm; color: var(--muted); background: #f6f7f3; font-style: italic; }
</style>
</head>
<body>
  <section class="cover">
    <div class="brand">Chronicle</div>
    <div class="cover-copy">
      <span class="kicker">A personal journal</span>
      <h1>Your days,<br>in your own words.</h1>
      <p class="cover-deck">A collection of thoughts, moments, and small details worth keeping.</p>
    </div>
    <div class="cover-note"><span>${entries.length} ${entries.length === 1 ? "entry" : "entries"}</span><span>Exported ${escapeHtml(exportedOn)}</span></div>
  </section>
  <header class="contents-head"><span class="kicker">Your journal</span><h2>Pages to return to</h2></header>
  ${entries.length ? entries.map(buildEntryHtml).join("\n") : '<p class="empty">Your pages will gather here as you write.</p>'}
</body>
</html>`;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div style="width:100%;margin:0 18mm;color:#82947c;font:8px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">Chronicle <span style="float:right;color:#85857d;letter-spacing:1px;">Personal journal</span></div>',
      footerTemplate: '<div style="width:100%;margin:0 18mm;color:#85857d;font:8px Arial,sans-serif;border-top:1px solid #e8e6df;padding-top:5px;">A personal record <span style="float:right;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
      margin: { top: "24mm", right: "18mm", bottom: "22mm", left: "18mm" },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
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
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const mood = typeof req.query.mood === "string" ? req.query.mood : "";
  const tag = typeof req.query.tag === "string" ? req.query.tag : "";
  const date = typeof req.query.date === "string" ? req.query.date : "";
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 20);
  const skip = (page - 1) * limit;
  const filter = { user: req.user.id };
  const sortOption = { date: req.query.sort === "oldest" ? 1 : -1 };

  try {
    if (q) {
      filter.$or = [
        {
          title: {
            $regex: escapeRegex(q),
            $options: "i",
          },
        },
        {
          content: {
            $regex: escapeRegex(q),
            $options: "i",
          },
        },
        {
          tags: {
            $regex: escapeRegex(q),
            $options: "i",
          },
        },
      ];
    }
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

const exportChronicles = async (req, res) => {
  const format = req.query.format || "json";
  const { ids, year, from, to } = req.query;

  if (!["json", "markdown", "pdf"].includes(format)) {
    return res.status(400).json({ message: "Invalid format" });
  }

  const filter = { user: req.user.id };

  if (ids !== undefined) {
    const list =
      typeof ids === "string" ? ids.split(",").map((id) => id.trim()) : [];

    if (!list.length || !list.every(isValidObjectId)) {
      return res.status(400).json({ message: "Invalid entry id" });
    }
    filter._id = { $in: list };
  } else if (year !== undefined) {
    const value = Number(year);

    if (!Number.isInteger(value) || value < 1970 || value > 9999) {
      return res.status(400).json({ message: "Invalid year" });
    }
    filter.date = {
      $gte: new Date(value, 0, 1),
      $lt: new Date(value + 1, 0, 1),
    };
  } else if (from || to) {
    const start = from ? new Date(from) : null;
    const end = to ? new Date(to) : null;

    if (
      (start && Number.isNaN(start.getTime())) ||
      (end && Number.isNaN(end.getTime()))
    ) {
      return res.status(400).json({ message: "Invalid date" });
    }

    filter.date = {};

    if (start) {
      start.setHours(0, 0, 0, 0);
      filter.date.$gte = start;
    }
    if (end) {
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  try {
    const chronicles = await Chronicle.find(filter).sort({ date: 1 }).lean();
    const date = new Date().toISOString().slice(0, 10);

    if (format === "pdf") {
      const pdf = await buildPdf(chronicles, date);

      res.set(
        "Content-Disposition",
        `attachment; filename="chronicles-${date}.pdf"`,
      );
      res.type("application/pdf");
      return res.status(200).send(pdf);
    }

    if (format === "json") {
      const data = chronicles.map(({ _id, user, __v, ...entry }) => ({
        id: _id.toString(),
        ...entry,
      }));

      res.set(
        "Content-Disposition",
        `attachment; filename="chronicles-${date}.json"`,
      );
      return res.status(200).json(data);
    }

    const entries = chronicles
      .map((entry) => {
        const heading = new Date(entry.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const title = entry.title ? `### ${entry.title}\n\n` : "";
        const meta = [
          entry.mood && `Mood: ${entry.mood}`,
          entry.tags?.length && `Tags: ${entry.tags.join(", ")}`,
        ]
          .filter(Boolean)
          .join(" | ");

        return `## ${heading}\n\n${title}${
          meta ? `_${meta}_\n\n` : ""
        }${entry.content}\n`;
      })
      .join("\n---\n\n");

    res.set(
      "Content-Disposition",
      `attachment; filename="chronicles-${date}.md"`,
    );
    res.type("text/markdown");
    return res
      .status(200)
      .send(`# Chronicle Export\n\nExported on ${date}\n\n---\n\n${entries}`);
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
  exportChronicles,
  getMoods,
  getTags,
  getChronicleStats,
};
