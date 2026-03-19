import fs from "fs";
import path from "path";
import genAI from "../config/gemini.js";

const ocrPrompt = `You are a document-to-HTML conversion assistant.

TASK:
Convert the provided document/image into a clean, structured HTML format that captures the primary layout, tables, and text content correctly.

RULES:
1. Output ONLY raw HTML starting with <!DOCTYPE html>.
2. Do NOT include any meta-commentary, preambles, or analysis descriptions. 
3. Reconstruct tables using <table> with borders.
4. Maintain logical separation (headers, paragraphs, lists).
5. Ensure the resulting HTML is a faithful transcription of the text in the image.
6. Use inline CSS <style> in <head> for basic layout (A4 width, padding).
7. Do NOT summarize—include all text from the document.
8. Output raw HTML only—no markdown code blocks.`;

const outputDir = path.resolve("outputs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

export const performOCR = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString("base64");
    
    // Determine mimeType
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = "application/pdf";
    if (ext === ".pdf") mimeType = "application/pdf";
    else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
    else if (ext === ".png") mimeType = "image/png";
    else if (ext === ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    console.log(`Sending file to Gemini OCR: ${filePath} (Mime: ${mimeType})`);

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro", 
      contents: [
        {
          parts: [
            { text: ocrPrompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0,
        maxOutputTokens: 65536,
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" }
        ]
      }
    });

    console.log("Gemini Response:", JSON.stringify(response, null, 2));

    let rawText = "";

    // Compatibility check for response structure
    if (typeof response.text === 'function') {
      rawText = response.text();
    } else if (response.text) {
      rawText = response.text;
    } else if (response.response && typeof response.response.text === 'function') {
      rawText = response.response.text();
    } else if (response?.candidates?.[0]?.content?.parts) {
      rawText = response.candidates[0].content.parts
        .map(p => p.text || "")
        .join("\n");
    }

    if (!rawText || rawText.trim() === "") {
        console.error("Empty response from Gemini OCR. Full response:", JSON.stringify(response, null, 2));
        return null;
    }

    // strip markdown code fences if Gemini wraps in ```html ... ```
    let html = rawText.trim();
    if (html.startsWith("```")) {
      html = html.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();
    }

    // New cleaning: keep only content starting from <!DOCTYPE or <html
    const lowerHtml = html.toLowerCase();
    const docTypeIndex = lowerHtml.indexOf("<!doctype html>");
    const htmlTagIndex = lowerHtml.indexOf("<html");
    
    let bestStartIndex = -1;
    if (docTypeIndex !== -1) bestStartIndex = docTypeIndex;
    else if (htmlTagIndex !== -1) bestStartIndex = htmlTagIndex;

    if (bestStartIndex !== -1) {
        html = html.substring(bestStartIndex);
    }

    // save as .html file
    const htmlName = `ocr_${Date.now()}.html`;
    const htmlPath = path.join(outputDir, htmlName);

    fs.writeFileSync(htmlPath, html, "utf8");
    console.log("Saved OCR HTML to:", htmlPath);

    return html;

  } catch (err) {
    console.error("Error performing OCR:", err);
    throw err;
  }
};

