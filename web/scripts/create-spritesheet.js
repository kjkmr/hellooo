#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// Check if canvas is installed
try {
  require.resolve("canvas");
} catch (e) {
  console.error("❌ canvasパッケージがインストールされていません");
  console.log("インストール: npm install canvas");
  process.exit(1);
}

// Configuration
const ICON_SIZE = 140; // 70 * 2 (retina)
const PADDING = 2;
const MAX_TEXTURE_SIZE = 2048;

const iconDir = path.join(__dirname, "../public/images/sprites/icons");
const qrDir = path.join(__dirname, "../public/images/sprites/qr");
const outputDir = path.join(__dirname, "../public/images/sprites");
const outputJsonPath = path.join(
  __dirname,
  "../src/app/bg/spritesheet-data.json",
);

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Calculate optimal grid size
 */
function calculateGridSize(numImages) {
  const cols = Math.ceil(Math.sqrt(numImages));
  const rows = Math.ceil(numImages / cols);

  // Check if it fits within MAX_TEXTURE_SIZE
  const width = cols * (ICON_SIZE + PADDING);
  const height = rows * (ICON_SIZE + PADDING);

  if (width > MAX_TEXTURE_SIZE || height > MAX_TEXTURE_SIZE) {
    // Adjust to fit within limits
    const maxCols = Math.floor(MAX_TEXTURE_SIZE / (ICON_SIZE + PADDING));
    return {
      cols: maxCols,
      rows: Math.ceil(numImages / maxCols),
    };
  }

  return { cols, rows };
}

/**
 * Create spritesheet from images
 */
async function createSpritesheet(imageDir, outputName, type) {
  console.log(`\n${type}スプライトシートを作成中...`);

  // Get all image files (prefer original JPG/PNG over WebP for canvas compatibility)
  const files = fs
    .readdirSync(imageDir)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
    .sort(); // Consistent ordering

  // If no JPG/PNG found, try WebP (might work with newer canvas versions)
  if (files.length === 0) {
    const webpFiles = fs
      .readdirSync(imageDir)
      .filter((file) => file.endsWith(".webp"))
      .sort();
    if (webpFiles.length > 0) {
      console.log("⚠️  JPG/PNG画像が見つからないため、WebPを使用します");
      files.push(...webpFiles);
    }
  }

  if (files.length === 0) {
    console.log(`${type}画像が見つかりません`);
    return null;
  }

  console.log(`${files.length}個の画像を処理`);

  // Calculate grid size
  const { cols, rows } = calculateGridSize(files.length);
  const canvasWidth = cols * (ICON_SIZE + PADDING) - PADDING;
  const canvasHeight = rows * (ICON_SIZE + PADDING) - PADDING;

  console.log(`キャンバスサイズ: ${canvasWidth}x${canvasHeight}`);

  // Create canvas
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Fill with transparent background
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Sprite data for JSON
  const frames = {};

  // Process each image
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imagePath = path.join(imageDir, file);
    const accountName = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");

    try {
      // Load image
      const image = await loadImage(imagePath);

      // Calculate position
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * (ICON_SIZE + PADDING);
      const y = row * (ICON_SIZE + PADDING);

      // Draw image on canvas
      ctx.drawImage(image, x, y, ICON_SIZE, ICON_SIZE);

      // Store frame data
      frames[accountName] = {
        frame: { x, y, w: ICON_SIZE, h: ICON_SIZE },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: ICON_SIZE, h: ICON_SIZE },
        sourceSize: { w: ICON_SIZE, h: ICON_SIZE },
      };

      process.stdout.write(`✓ ${accountName} `);
      if ((i + 1) % 5 === 0) console.log(); // New line every 5 items
    } catch (error) {
      console.error(`\n✗ エラー: ${file}:`, error.message);
    }
  }
  console.log("\n");

  // Save spritesheet as PNG (better for sprites than WebP)
  const outputPath = path.join(outputDir, outputName);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);

  console.log(`✓ スプライトシート保存: ${outputName}`);
  console.log(`  サイズ: ${(buffer.length / 1024).toFixed(1)}KB`);

  return {
    frames,
    meta: {
      app: "hellooo-spritesheet-generator",
      version: "1.0",
      image: `/images/sprites/${outputName}`,
      format: "RGBA8888",
      size: { w: canvasWidth, h: canvasHeight },
      scale: 1,
    },
  };
}

/**
 * Convert spritesheet to WebP format using cwebp
 */
async function convertToWebP(pngPath) {
  const { exec } = require("child_process");
  const { promisify } = require("util");
  const execAsync = promisify(exec);

  const webpPath = pngPath.replace(".png", ".webp");

  try {
    // Check if cwebp is available
    await execAsync("cwebp -version");

    // Convert to WebP with high quality
    const command = `cwebp -q 90 -m 6 "${pngPath}" -o "${webpPath}"`;
    await execAsync(command);

    // Get file sizes
    const pngSize = fs.statSync(pngPath).size;
    const webpSize = fs.statSync(webpPath).size;
    const reduction = ((1 - webpSize / pngSize) * 100).toFixed(1);

    console.log(`✓ WebP変換完了: ${reduction}%削減`);
    console.log(
      `  PNG: ${(pngSize / 1024).toFixed(1)}KB → WebP: ${(webpSize / 1024).toFixed(1)}KB`,
    );

    return webpPath;
  } catch (error) {
    console.log("⚠️  WebP変換をスキップ（cwebpが利用できません）");
    return null;
  }
}

/**
 * Main process
 */
async function main() {
  console.log("🎨 スプライトシート生成を開始...");

  try {
    // Create icon spritesheet
    const iconData = await createSpritesheet(
      iconDir,
      "icons-sprite.png",
      "アイコン",
    );

    // Create QR spritesheet
    const qrData = await createSpritesheet(qrDir, "qr-sprite.png", "QR");

    // Convert to WebP
    if (iconData) {
      const iconPngPath = path.join(outputDir, "icons-sprite.png");
      const iconWebpPath = await convertToWebP(iconPngPath);
      if (iconWebpPath) {
        iconData.meta.imageWebp = `/images/sprites/icons-sprite.webp`;
      }
    }

    if (qrData) {
      const qrPngPath = path.join(outputDir, "qr-sprite.png");
      const qrWebpPath = await convertToWebP(qrPngPath);
      if (qrWebpPath) {
        qrData.meta.imageWebp = `/images/sprites/qr-sprite.webp`;
      }
    }

    // Save combined JSON data
    const spritesheetData = {
      icons: iconData,
      qr: qrData,
    };

    fs.writeFileSync(outputJsonPath, JSON.stringify(spritesheetData, null, 2));
    console.log(`\n✓ メタデータ保存: spritesheet-data.json`);

    // Calculate total size
    const files = fs.readdirSync(outputDir);
    let totalSize = 0;
    files.forEach((file) => {
      const filePath = path.join(outputDir, file);
      totalSize += fs.statSync(filePath).size;
    });

    console.log("\n========================================");
    console.log("✅ スプライトシート生成完了！");
    console.log(`出力先: ${outputDir}`);
    console.log(`合計サイズ: ${(totalSize / 1024).toFixed(1)}KB`);
    console.log("========================================");
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

// Run
main();
