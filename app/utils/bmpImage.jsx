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

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  if (lines.length > 2) {
    lines = lines.slice(0, 2);
    lines[1] = lines[1].trim() + "...";
  }


  for (let i = 0; i < lines.length; i++) {
    context.fillText(lines[i].trim(), x, y + i * lineHeight);
  }
}

export function generateTaskBMP(
  weeklyTasksData,
  tasksData,
  totalTasks,
  tomorrowTasks,
  projects,
  quote
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
  ctx.font = "16px 'Open Sans'";
  ctx.textAlign = "center";
  wrapText(ctx, quote, width / 2, height - 60, width - 80, 20);
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
export function generateQuoteBuffer(quote, author = "") {
  const width = 800;
  const height = 480;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  
  // White background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  
  // Draw text (your existing drawing code)
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  function wrapAndDrawText(text, x, y, maxWidth, font, lineHeight) {
    ctx.font = font;
    const words = text.split(" ");
    let line = "";
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const totalTextHeight = lines.length * lineHeight;
    let startY = y - totalTextHeight / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line.trim(), x, startY + index * lineHeight);
    });
    return startY + totalTextHeight;
  }

  // Draw quote
  const lastLineY = wrapAndDrawText(
    quote,
    width / 2,
    height / 2,
    width - 80,
    "48px 'Open Sans'",
    60
  );

  // Draw author
  if (author) {
    ctx.font = "italic 32px 'Open Sans'";
    ctx.textAlign = "right";
    ctx.fillText(`- ${author}`, width - 60, lastLineY + 50);
  }

  // --- Convert to 1-bit raw buffer for e-ink ---
  
  // Get image data (RGBA)
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Calculate buffer size: width * height / 8 (8 pixels per byte)
  const bufferSize = (width * height) / 8;
  const buffer = Buffer.alloc(bufferSize);
  
  // Convert to 1-bit (MSB first, typical e-ink format)
  // Note: E-ink displays often need rotation or bit-order flipping
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4; // RGBA index
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Convert to grayscale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Determine bit value: 0 = black, 1 = white (GxEPD2 convention)
      // If your image appears inverted, change: gray > 127 ? 0 : 1
      const bit = gray > 127 ? 1 : 0;
      
      // Calculate byte position
      const byteIndex = Math.floor((y * width + x) / 8);
      const bitIndex = 7 - (x % 8); // MSB first
      
      if (bit === 0) {
        buffer[byteIndex] |= (1 << bitIndex); // Set bit to 0? No wait...
      }
      // Actually, let's build the byte properly
    }
  }
  
  // Cleaner bit packing:
  let byteIndex = 0;
  let bitMask = 0x80; // Start with MSB
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx+1] + 0.114 * data[idx+2];
      
      // For GxEPD2: 0 = black, 1 = white
      if (gray > 127) {
        buffer[byteIndex] |= bitMask; // White pixel
      }
      // else leave as 0 (black)
      
      bitMask >>= 1;
      if (bitMask === 0) {
        bitMask = 0x80;
        byteIndex++;
      }
    }
  }

  return buffer;
}

// Then in your API endpoint:
