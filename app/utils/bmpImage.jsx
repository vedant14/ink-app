import { createCanvas } from "canvas";

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

export function generateTaskBMP(tasksData) {
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

  ctx.font = "bold 40px sans-serif";
  ctx.fillText("Tasks", 40, 40);

  ctx.font = "28px sans-serif";
  const lineHeight = 50;
  let startY = 120;

  tasksData.forEach((task, index) => {
    const y = startY + index * lineHeight;
    const taskTitle = task.content || "Untitled Task";

    ctx.beginPath();
    ctx.arc(60, y + 15, 12, 0, Math.PI * 2, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.fillText(taskTitle, 90, y);
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

  for (let y = height - 1; y >= 0; y--) {
    const rowStart = pixelDataOffset + (height - 1 - y) * stride;
    for (let x = 0; x < width; x++) {
      const color = ctx.getImageData(x, y, 1, 1).data[0];
      let paletteIndex;
      if (color < 64) paletteIndex = 0;
      else if (color < 128) paletteIndex = 5;
      else if (color < 192) paletteIndex = 10;
      else paletteIndex = 15;

      const byteIndex = rowStart + Math.floor(x / 2);
      if (x % 2 === 0) {
        buffer[byteIndex] = paletteIndex << 4;
      } else {
        buffer[byteIndex] |= paletteIndex;
      }
    }
  }

  return buffer;
}
