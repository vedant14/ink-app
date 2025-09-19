import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import path from "path";
const fontPath = path.join(process.cwd(), "public/fonts/NotoSans-Regular.ttf");
GlobalFonts.registerFromPath(fontPath, "Open Sans");

export function generatePoemBMP(poem) {
  const width = 800;
  const height = 480;
  const bitsPerPixel = 4;
  const colorTableSize = 16;

  const bytesPerRowUnpadded = Math.ceil((width * bitsPerPixel) / 8);
  const stride = Math.ceil(bytesPerRowUnpadded / 4) * 4;
  const imageSize = stride * height;

  const bmpHeaderSize = 54;
  const colorTableBytes = colorTableSize * 4;
  const dibHeaderSize = 40;
  const pixelDataOffset = bmpHeaderSize + colorTableBytes;
  const fileSize = pixelDataOffset + imageSize;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = 24;
  ctx.font = `${fontSize}px sans-serif`;

  const poemText = poem.Poem || "";
  const poet = poem.Poet || "";
  const words = poemText.split(/\s+/);
  let line = "";
  const lines = [];
  const maxWidth = width - 40;

  lines.push(poem.Title);
  lines.push("");
  for (const word of words) {
    const testLine = line ? line + " " + word : word;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  if (poet) {
    lines.push("");
    lines.push("- " + poet);
  }

  const lineHeight = fontSize * 1.3;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (height - totalTextHeight) / 2 + lineHeight / 2;

  lines.forEach((textLine, index) => {
    ctx.fillText(textLine.trim(), width / 2, startY + index * lineHeight);
  });

  const buffer = Buffer.alloc(fileSize);

  buffer.write("BM", 0);
  buffer.writeUInt32LE(fileSize, 2);
  buffer.writeUInt32LE(0, 6);
  buffer.writeUInt32LE(pixelDataOffset, 10);

  buffer.writeUInt32LE(dibHeaderSize, 14);
  buffer.writeUInt32LE(width, 18);
  buffer.writeUInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26);
  buffer.writeUInt16LE(bitsPerPixel, 28);
  buffer.writeUInt32LE(0, 30);
  buffer.writeUInt32LE(imageSize, 34);
  buffer.writeUInt32LE(2835, 38);
  buffer.writeUInt32LE(2835, 42);
  buffer.writeUInt32LE(colorTableSize, 46);
  buffer.writeUInt32LE(0, 50);

  for (let i = 0; i < colorTableSize; i++) {
    const gray = Math.floor((i / (colorTableSize - 1)) * 255);
    const offset = bmpHeaderSize + i * 4;
    buffer.writeUInt8(gray, offset);
    buffer.writeUInt8(gray, offset + 1);
    buffer.writeUInt8(gray, offset + 2);
    buffer.writeUInt8(0, offset + 3);
  }

  let pixelIndex = pixelDataOffset;
  const paddingBytes = stride - bytesPerRowUnpadded;

  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const color = ctx.getImageData(x, y, 1, 1).data[0];

      let paletteIndex;
      if (color < 64) {
        paletteIndex = 0;
      } else if (color < 128) {
        paletteIndex = 5;
      } else if (color < 192) {
        paletteIndex = 10;
      } else {
        paletteIndex = 15;
      }

      if (x % 2 === 0) {
        buffer[pixelIndex] = paletteIndex << 4;
      } else {
        buffer[pixelIndex] |= paletteIndex;
        pixelIndex++;
      }
    }

    for (let p = 0; p < paddingBytes; p++) {
      buffer.writeUInt8(0, pixelIndex++);
    }
  }

  return buffer;
}

const getProjectNameById = (projects, id) => {
  const project = projects.find((p) => p.id === id);
  return project ? project.name : null;
};

export function generateTaskBMP(
  weeklyTasksData,
  tasksData,
  totalTasks,
  tomorrowTasks,
  projects
) {
  const width = 800;
  const height = 480;
  const bitsPerPixel = 4;
  const colorTableSize = 16;
  const bytesPerRowUnpadded = Math.ceil((width * bitsPerPixel) / 8);
  const stride = Math.ceil(bytesPerRowUnpadded / 4) * 4;
  const imageSize = stride * height;

  const bmpHeaderSize = 54;
  const colorTableBytes = colorTableSize * 4;
  const dibHeaderSize = 40;
  const pixelDataOffset = bmpHeaderSize + colorTableBytes;
  const fileSize = pixelDataOffset + imageSize;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let startY = 40; // Initial Y position
  if (weeklyTasksData && weeklyTasksData.length > 0) {
    ctx.font = "bold 32px 'Open Sans'";
    ctx.fillText("Weekly Focus", 40, startY);
    startY += 50;

    const weeklyLineHeight = 45;
    ctx.font = "28px 'Open Sans'";
    weeklyTasksData.forEach((task, index) => {
      const y = startY + index * weeklyLineHeight;
      const taskTitle = task.content;
      ctx.fillText("★", 55, y);
      ctx.fillText(taskTitle, 90, y);
    });

    startY += weeklyTasksData.length * weeklyLineHeight + 20; // Add padding
    ctx.beginPath();
    ctx.moveTo(40, startY);
    ctx.lineTo(width - 40, startY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();
    startY += 25;
  }
  if (!tasksData || tasksData.length === 0) {
    ctx.textAlign = "center";
    ctx.font = "32px 'Open Sans'";
    ctx.fillText("No tasks for today, relax!", width / 2, height / 2 + 50);
  } else {
    ctx.textAlign = "left";
    ctx.font = "40px 'Open Sans'";
    ctx.fillText("Today (" + totalTasks + ")", 40, startY);
    startY += 60;

    ctx.font = "28px 'Open Sans'";
    const lineHeight = 50;

    tasksData.forEach((task, index) => {
      if (startY + index * lineHeight > height - 80) return; // Avoid drawing off-screen
      const y = startY + index * lineHeight;
      const projectName = getProjectNameById(projects, task.projectId);
      const taskTitle = `${task.content} (P${
        5 - task.priority
      }) #${projectName}`;
      ctx.beginPath();
      ctx.arc(60, y + 15, 12, 0, Math.PI * 2, false);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.stroke();

      ctx.fillStyle = "black";
      ctx.fillText(taskTitle, 90, y);
    });
  }
  ctx.fillStyle = "black";
  ctx.font = "18px 'Open Sans'";
  ctx.fillText("Tomorrow's tasks: " + tomorrowTasks, 60, height - 40);
  const buffer = Buffer.alloc(fileSize);
  buffer.write("BM", 0);
  buffer.writeUInt32LE(fileSize, 2);
  buffer.writeUInt32LE(0, 6);
  buffer.writeUInt32LE(pixelDataOffset, 10);
  buffer.writeUInt32LE(dibHeaderSize, 14);
  buffer.writeUInt32LE(width, 18);
  buffer.writeUInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26);
  buffer.writeUInt16LE(bitsPerPixel, 28);
  buffer.writeUInt32LE(0, 30);
  buffer.writeUInt32LE(imageSize, 34);
  buffer.writeUInt32LE(2835, 38);
  buffer.writeUInt32LE(2835, 42);
  buffer.writeUInt32LE(colorTableSize, 46);
  buffer.writeUInt32LE(0, 50);

  for (let i = 0; i < colorTableSize; i++) {
    const gray = Math.floor((i / (colorTableSize - 1)) * 255);
    const offset = bmpHeaderSize + i * 4;
    buffer.writeUInt8(gray, offset);
    buffer.writeUInt8(gray, offset + 1);
    buffer.writeUInt8(gray, offset + 2);
    buffer.writeUInt8(0, offset + 3);
  }

  for (let y = height - 1; y >= 0; y--) {
    const rowStart = pixelDataOffset + (height - 1 - y) * stride;
    for (let x = 0; x < width; x++) {
      const color = ctx.getImageData(x, y, 1, 1).data[0];
      let paletteIndex = Math.round((color / 255) * 15);
      const byteIndex = rowStart + Math.floor(x / 2);
      if (x % 2 === 0) {
        buffer[byteIndex] = (buffer[byteIndex] & 0x0f) | (paletteIndex << 4);
      } else {
        buffer[byteIndex] = (buffer[byteIndex] & 0xf0) | paletteIndex;
      }
    }
  }

  return buffer;
}
export function generateQuoteBMP(quote, author = "") {
  // --- 1. Image and BMP File Configuration ---
  const width = 800;
  const height = 480;
  const bitsPerPixel = 4; // 4-bit grayscale
  const colorTableSize = 16; // 2^4 = 16 colors

  // Calculate memory and size requirements for the BMP file
  const bytesPerRowUnpadded = Math.ceil((width * bitsPerPixel) / 8);
  const stride = Math.ceil(bytesPerRowUnpadded / 4) * 4; // Row size must be a multiple of 4 bytes
  const imageSize = stride * height;

  const bmpHeaderSize = 54;
  const colorTableBytes = colorTableSize * 4;
  const dibHeaderSize = 40;
  const pixelDataOffset = bmpHeaderSize + colorTableBytes;
  const fileSize = pixelDataOffset + imageSize;

  // --- 2. Drawing the Quote on an In-Memory Canvas ---
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Set a white background
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  // Style for the quote text
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Helper function to wrap text and draw it
  function wrapAndDrawText(text, x, y, maxWidth, font, lineHeight) {
    ctx.font = font;
    const words = text.split(" ");
    let line = "";
    const lines = [];

    // Create lines of text that fit within the maxWidth
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Calculate the total height to vertically center the block of text
    const totalTextHeight = lines.length * lineHeight;
    let startY = y - totalTextHeight / 2;

    // Draw each line
    lines.forEach((line, index) => {
      ctx.fillText(line.trim(), x, startY + index * lineHeight);
    });

    // Return the Y position for the next element
    return startY + totalTextHeight;
  }

  // Draw the main quote
  const quoteFont = "48px 'Open Sans'";
  const quoteLineHeight = 60;
  const lastLineY = wrapAndDrawText(
    quote,
    width / 2,
    height / 2,
    width - 80,
    quoteFont,
    quoteLineHeight
  );

  // Draw the author if provided
  if (author) {
    ctx.font = "italic 32px 'Open Sans'";
    ctx.textAlign = "right";
    ctx.fillText(`- ${author}`, width - 60, lastLineY + 50);
  }

  // --- 3. Manually Building the BMP File Buffer ---

  // Allocate memory for the entire file
  const buffer = Buffer.alloc(fileSize);

  // Write BMP Header (14 bytes)
  buffer.write("BM", 0); // Magic number
  buffer.writeUInt32LE(fileSize, 2);
  buffer.writeUInt32LE(0, 6); // Reserved
  buffer.writeUInt32LE(pixelDataOffset, 10);

  // Write DIB Header (40 bytes)
  buffer.writeUInt32LE(dibHeaderSize, 14);
  buffer.writeUInt32LE(width, 18);
  buffer.writeUInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26); // Color Planes
  buffer.writeUInt16LE(bitsPerPixel, 28);
  buffer.writeUInt32LE(0, 30); // BI_RGB (no compression)
  buffer.writeUInt32LE(imageSize, 34);
  buffer.writeUInt32LE(2835, 38); // Print resolution (72 DPI)
  buffer.writeUInt32LE(2835, 42); // Print resolution (72 DPI)
  buffer.writeUInt32LE(colorTableSize, 46);
  buffer.writeUInt32LE(0, 50); // Important colors (0 = all)

  // Write Color Table (Palette) - 16 shades of gray
  for (let i = 0; i < colorTableSize; i++) {
    const gray = Math.floor((i / (colorTableSize - 1)) * 255);
    const offset = bmpHeaderSize + i * 4;
    buffer.writeUInt8(gray, offset); // Blue
    buffer.writeUInt8(gray, offset + 1); // Green
    buffer.writeUInt8(gray, offset + 2); // Red
    buffer.writeUInt8(0, offset + 3); // Reserved (Alpha)
  }

  // --- 4. Encoding Pixel Data from Canvas to BMP Format ---

  // Iterate over canvas pixels from bottom-to-top (BMP standard)
  for (let y = height - 1; y >= 0; y--) {
    const rowStart = pixelDataOffset + (height - 1 - y) * stride;
    for (let x = 0; x < width; x++) {
      // Get the grayscale value of the pixel from the canvas
      const color = ctx.getImageData(x, y, 1, 1).data[0];

      // Find the closest color in our 16-color grayscale palette
      let paletteIndex = Math.round((color / 255) * 15);

      // Find the byte in the buffer where this pixel should be stored
      const byteIndex = rowStart + Math.floor(x / 2);

      // Pack two 4-bit pixels into a single 8-bit byte
      if (x % 2 === 0) {
        // Even pixel: goes in the high 4 bits
        buffer[byteIndex] = (buffer[byteIndex] & 0x0f) | (paletteIndex << 4);
      } else {
        // Odd pixel: goes in the low 4 bits
        buffer[byteIndex] = (buffer[byteIndex] & 0xf0) | paletteIndex;
      }
    }
  }

  return buffer;
}
