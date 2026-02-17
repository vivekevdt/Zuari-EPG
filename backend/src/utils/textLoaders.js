import { createRequire } from "module";
const require = createRequire(import.meta.url);
import mammoth from "mammoth";
import fs from "fs";
const pdfParseModule = require("pdf-parse");
const pdf = pdfParseModule.default || pdfParseModule;


// ---------------- LOADERS ----------------


export async function loadPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    return data.text;
  } catch (err) {
    throw new Error("PDF parse failed: " + err.message);
  }
}

export async function loadDOCX(path) {
  const result = await mammoth.extractRawText({ path });
  return result.value;
}

// ---------------- CLEAN TEXT ----------------

function cleanText(text) {
  return text
    .replace(/Proposed by[\s\S]*?Managing Director/gi, "")
    .replace(/Version\s*–.*?\d{4}/gi, "")
    .replace(/Circulation:.*?/gi, "")
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n") // collapse multiple blank lines
    .trim();
}

// ---------------- DETECT HOLIDAY CIRCULAR ----------------

function isHolidayCircular(text) {
  return /CIRCULAR/i.test(text) && /Holiday/i.test(text);
}

// ---------------- EXTRACT HOLIDAYS SAFELY ----------------

function extractHolidayChunks(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  let confirmed = [];
  let optional = [];

  let currentType = "Confirmed";

  for (let i = 0; i < lines.length; i++) {
    // Switch to Optional section
    if (/In addition to the above/i.test(lines[i])) {
      currentType = "Optional";
      continue;
    }


    // Detect holiday entry (date pattern)
    const dateMatch = lines[i].match(/\d{1,2}\s+[A-Za-z]+\s+2026/);

    if (dateMatch && i > 0 && i < lines.length - 1) {
      const date = lines[i];
      const holidayName = lines[i - 1];
      const day = lines[i + 1];

      const holidayText = `Holiday: ${holidayName} | Date: ${date} | Day: ${day}`;

      if (currentType === "Confirmed") {
        confirmed.push({
          content: holidayText,
          holidayType: "Confirmed"
        });
      } else {
        optional.push({
          content: holidayText,
          holidayType: "Optional"
        });
      }
    }
  }

  const fullList = [
    "--- CONFIRMED HOLIDAYS ---",
    ...confirmed.map(h => h.content),
    "\n--- OPTIONAL HOLIDAYS ---",
    ...optional.map(h => h.content)
  ].join("\n");

  return [{ content: fullList }];
}

// ---------------- SECTION SPLIT (FOR POLICIES) ----------------

function splitBySections(text) {
  const sectionPattern =
    /(Privilege Leave|Sick Leave|Casual Leave|Maternity Leave|Relocation Leave|Leave Without Pay|Short Leave|GENERAL LEAVE RULES|Working Norms|Attendance Procedure|Work from Home|Public Holidays)/gi;

  const parts = text.split(sectionPattern);

  let sections = [];

  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i];
    const content = parts[i + 1] || "";

    const fullSection = (heading + " " + content).trim();

    if (fullSection.length > 100) {
      sections.push(fullSection);
    }
  }

  return sections;
}

// ---------------- LARGE SPLIT ----------------

function splitLargeChunk(content, maxWords = 450, overlap = 80) {
  const words = content.split(/\s+/);

  if (words.length <= maxWords) return [content];

  const chunks = [];

  for (let i = 0; i < words.length; i += (maxWords - overlap)) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }

  return chunks;
}

// ---------------- MAIN CHUNK FUNCTION ----------------

export function chunkText(rawText) {
  const cleaned = cleanText(rawText);

  if (isHolidayCircular(cleaned)) {
    return extractHolidayChunks(cleaned);
  }

  const sections = splitBySections(cleaned);

  if (sections.length === 0) {
    return cleaned.length > 50 ? [{ content: cleaned }] : [];
  }

  let finalChunks = [];

  sections.forEach(section => {
    const splitParts = splitLargeChunk(section);
    splitParts.forEach(part => {
      finalChunks.push({ content: part });
    });
  });

  return finalChunks;
}

