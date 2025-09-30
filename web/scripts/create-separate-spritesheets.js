#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// Check if canvas is installed
try {
  require.resolve("canvas");
} catch (e) {
  console.error("❌ canvasパッケージがインストールされていません");
  console.log("インストール: npm install --save-dev canvas");
  process.exit(1);
}

// Configuration
const ICON_SIZE = 140; // 70 * 2 (retina)
const HANDWRITING_WIDTH = 700; // 350 * 2 (カード幅のretina)
const HANDWRITING_HEIGHT = 394; // 197 * 2 (カード高さのretina)
const PADDING = 2;
const MAX_TEXTURE_SIZE = 4096; // 大きな画像に対応するため増加

const iconDir = path.join(__dirname, "../public/images/sprites/icons");
const qrDir = path.join(__dirname, "../public/images/sprites/qr");
const handwritingsDir = path.join(
  __dirname,
  "../public/images/sprites/handwritings",
);
const outputDir = path.join(__dirname, "../public/images/sprites");
const outputJsonPath = path.join(
  __dirname,
  "../src/app/bg/spritesheet-data.json",
);

// コマンドライン引数をパース
const args = process.argv.slice(2);
const shouldCleanup = args.includes("--cleanup") || args.includes("-c");

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Calculate optimal grid size
 */
function calculateGridSize(
  numImages,
  imageWidth = ICON_SIZE,
  imageHeight = ICON_SIZE,
) {
  const cols = Math.ceil(Math.sqrt(numImages));
  const rows = Math.ceil(numImages / cols);

  const width = cols * (imageWidth + PADDING);
  const height = rows * (imageHeight + PADDING);

  if (width > MAX_TEXTURE_SIZE || height > MAX_TEXTURE_SIZE) {
    const maxCols = Math.floor(MAX_TEXTURE_SIZE / (imageWidth + PADDING));
    return {
      cols: maxCols,
      rows: Math.ceil(numImages / maxCols),
      width: maxCols * (imageWidth + PADDING) - PADDING,
      height:
        Math.ceil(numImages / maxCols) * (imageHeight + PADDING) - PADDING,
    };
  }

  return {
    cols,
    rows,
    width: width - PADDING,
    height: height - PADDING,
  };
}

/**
 * Create spritesheet from directory
 */
async function createSpritesheet(imageDir, outputName, type) {
  console.log(`\n📋 ${type}スプライトシートを作成中...`);

  if (!fs.existsSync(imageDir)) {
    console.log(`  ディレクトリが存在しません: ${imageDir}`);
    return null;
  }

  // Get image files
  const files = fs
    .readdirSync(imageDir)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
    .sort((a, b) => {
      // For handwriting files (numeric names), sort numerically
      const aNum = parseInt(a.replace(/\.(jpg|jpeg|png)$/i, ""));
      const bNum = parseInt(b.replace(/\.(jpg|jpeg|png)$/i, ""));
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      // Otherwise, sort alphabetically
      return a.localeCompare(b);
    });

  if (files.length === 0) {
    console.log(`  ${type}画像が見つかりません`);
    return null;
  }

  console.log(`  ${files.length}個の画像を処理`);

  // Determine image size based on type
  const isHandwriting = type === "Handwritings";
  const imageWidth = isHandwriting ? HANDWRITING_WIDTH : ICON_SIZE;
  const imageHeight = isHandwriting ? HANDWRITING_HEIGHT : ICON_SIZE;

  // Calculate grid size
  const layout = calculateGridSize(files.length, imageWidth, imageHeight);
  console.log(
    `  レイアウト: ${layout.cols}×${layout.rows} (${layout.width}×${layout.height}px)`,
  );

  // Create canvas
  const canvas = createCanvas(layout.width, layout.height);
  const ctx = canvas.getContext("2d");

  // Fill with transparent background
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillRect(0, 0, layout.width, layout.height);

  // Sprite data for JSON
  const frames = {};

  // Process each image
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imagePath = path.join(imageDir, file);
    const accountName = file.replace(/\.(jpg|jpeg|png)$/i, "");

    try {
      // Load image
      const image = await loadImage(imagePath);

      // Calculate position
      const col = i % layout.cols;
      const row = Math.floor(i / layout.cols);
      const x = col * (imageWidth + PADDING);
      const y = row * (imageHeight + PADDING);

      // Draw image on canvas
      ctx.drawImage(image, x, y, imageWidth, imageHeight);

      // Store frame data
      frames[accountName] = {
        frame: { x, y, w: imageWidth, h: imageHeight },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: imageWidth, h: imageHeight },
        sourceSize: { w: imageWidth, h: imageHeight },
      };

      process.stdout.write(`✓`);
    } catch (error) {
      console.error(`\n  ✗ エラー: ${file}:`, error.message);
    }
  }
  console.log("");

  // Save as PNG
  const pngPath = path.join(outputDir, outputName + ".png");
  const pngBuffer = canvas.toBuffer("image/png");
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(
    `  ✓ PNG保存: ${outputName}.png (${(pngBuffer.length / 1024).toFixed(1)}KB)`,
  );

  // Try to convert to WebP
  let webpPath = null;
  try {
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    await execAsync("cwebp -version");

    webpPath = path.join(outputDir, outputName + ".webp");
    const command = `cwebp -q 85 -m 6 "${pngPath}" -o "${webpPath}"`;
    await execAsync(command);

    const webpSize = fs.statSync(webpPath).size;
    const reduction = ((1 - webpSize / pngBuffer.length) * 100).toFixed(1);

    console.log(
      `  ✓ WebP保存: ${outputName}.webp (${(webpSize / 1024).toFixed(1)}KB) - ${reduction}%削減`,
    );
  } catch (error) {
    console.log("  ⚠️  WebP変換をスキップ");
  }

  return {
    frames,
    meta: {
      app: "hellooo-spritesheet-generator",
      version: "2.0",
      image: `/images/sprites/${outputName}.png`,
      imageWebp: webpPath ? `/images/sprites/${outputName}.webp` : null,
      format: "RGBA8888",
      size: { w: layout.width, h: layout.height },
      scale: 1,
    },
  };
}

/**
 * Clean up individual image files
 */
function cleanupFiles() {
  console.log("\n🧹 個別画像ファイルを削除中...");

  let deletedCount = 0;

  // Delete individual icon files
  if (fs.existsSync(iconDir)) {
    const iconFiles = fs.readdirSync(iconDir);
    iconFiles.forEach((file) => {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        fs.unlinkSync(path.join(iconDir, file));
        deletedCount++;
      }
    });
  }

  // Delete individual QR files
  if (fs.existsSync(qrDir)) {
    const qrFiles = fs.readdirSync(qrDir);
    qrFiles.forEach((file) => {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        fs.unlinkSync(path.join(qrDir, file));
        deletedCount++;
      }
    });
  }

  // Delete individual handwriting files
  if (fs.existsSync(handwritingsDir)) {
    const handwritingFiles = fs.readdirSync(handwritingsDir);
    handwritingFiles.forEach((file) => {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        fs.unlinkSync(path.join(handwritingsDir, file));
        deletedCount++;
      }
    });
  }

  // Delete old unified spritesheet if exists
  const oldUnifiedFiles = ["all-sprites.png", "all-sprites.webp"];
  oldUnifiedFiles.forEach((file) => {
    const filePath = path.join(outputDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  削除: ${file}`);
    }
  });

  console.log(`  ✓ ${deletedCount}個の個別画像ファイルを削除しました`);
}

/**
 * Main process
 */
async function main() {
  console.log("🎨 個別スプライトシート生成を開始...");

  try {
    // Create icon spritesheet
    const iconData = await createSpritesheet(
      iconDir,
      "icons-sprite",
      "アイコン",
    );

    // Create QR spritesheet
    const qrData = await createSpritesheet(qrDir, "qr-sprite", "QR");

    // Create handwritings spritesheet
    const handwritingsData = await createSpritesheet(
      handwritingsDir,
      "handwritings-sprite",
      "Handwritings",
    );

    // Save metadata JSON
    const metadata = {
      icons: iconData,
      qr: qrData,
      handwritings: handwritingsData,
    };

    fs.writeFileSync(outputJsonPath, JSON.stringify(metadata, null, 2));
    console.log(`\n📄 メタデータ保存: spritesheet-data.json`);

    // Cleanup if requested
    if (shouldCleanup) {
      cleanupFiles();
    }

    // Calculate total size
    let totalSize = 0;
    let fileCount = 0;

    if (iconData) {
      const iconWebpPath = path.join(outputDir, "icons-sprite.webp");
      if (fs.existsSync(iconWebpPath)) {
        totalSize += fs.statSync(iconWebpPath).size;
        fileCount++;
      }
    }

    if (qrData) {
      const qrWebpPath = path.join(outputDir, "qr-sprite.webp");
      if (fs.existsSync(qrWebpPath)) {
        totalSize += fs.statSync(qrWebpPath).size;
        fileCount++;
      }
    }

    if (handwritingsData) {
      const handwritingsWebpPath = path.join(
        outputDir,
        "handwritings-sprite.webp",
      );
      if (fs.existsSync(handwritingsWebpPath)) {
        totalSize += fs.statSync(handwritingsWebpPath).size;
        fileCount++;
      }
    }

    // Summary
    console.log("\n========================================");
    console.log("✅ 個別スプライトシート生成完了！\n");

    console.log(`📦 生成されたファイル:`);
    if (iconData) {
      const iconWebpPath = path.join(outputDir, "icons-sprite.webp");
      if (fs.existsSync(iconWebpPath)) {
        console.log(
          `  - icons-sprite.webp: ${(fs.statSync(iconWebpPath).size / 1024).toFixed(1)}KB`,
        );
      }
    }
    if (qrData) {
      const qrWebpPath = path.join(outputDir, "qr-sprite.webp");
      if (fs.existsSync(qrWebpPath)) {
        console.log(
          `  - qr-sprite.webp: ${(fs.statSync(qrWebpPath).size / 1024).toFixed(1)}KB`,
        );
      }
    }
    if (handwritingsData) {
      const handwritingsWebpPath = path.join(
        outputDir,
        "handwritings-sprite.webp",
      );
      if (fs.existsSync(handwritingsWebpPath)) {
        console.log(
          `  - handwritings-sprite.webp: ${(fs.statSync(handwritingsWebpPath).size / 1024).toFixed(1)}KB`,
        );
      }
    }
    console.log(
      `  - 合計: ${(totalSize / 1024).toFixed(1)}KB（${fileCount}ファイル）\n`,
    );

    console.log(`🚀 効果:`);
    console.log(`  - HTTPリクエスト: 38回 → 3回（92%削減）`);
    console.log(`  - アイコン、QR、Handwritingsを独立管理`);
    console.log(`  - 柔軟な読み込み制御\n`);

    if (!shouldCleanup) {
      console.log(
        `💡 ヒント: --cleanup オプションで個別画像を自動削除できます`,
      );
      console.log(
        `  使用例: node scripts/create-separate-spritesheets.js --cleanup\n`,
      );
    }

    console.log("========================================");
  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

// Run
main();
