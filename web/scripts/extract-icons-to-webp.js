#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// icons.tsファイルのパスを設定（バックアップファイルから読み込む）
const iconsFilePath = path.join(__dirname, "../src/app/bg/icons.backup.ts");
const outputDir = path.join(__dirname, "../public/images/sprites/icons");
const outputQrDir = path.join(__dirname, "../public/images/sprites/qr");
const outputHandwritingsDir = path.join(
  __dirname,
  "../public/images/sprites/handwritings",
);
const outputJsonPath = path.join(__dirname, "../src/app/bg/icons-data.json");
const handwritingsSourceDir = path.join(
  __dirname,
  "../src/app/bg/handwritings",
);

// 出力ディレクトリを作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(outputQrDir)) {
  fs.mkdirSync(outputQrDir, { recursive: true });
}
if (!fs.existsSync(outputHandwritingsDir)) {
  fs.mkdirSync(outputHandwritingsDir, { recursive: true });
}

// icons.tsファイルを読み込み
const iconsContent = fs.readFileSync(iconsFilePath, "utf8");

// アイコンデータを抽出
const iconsRegex = /export const icons: Icon\[\] = (\[[\s\S]*?\]);/;
const match = iconsContent.match(iconsRegex);

if (!match) {
  console.error("icons配列が見つかりませんでした");
  process.exit(1);
}

// icons配列を安全に評価
let iconsArray;
try {
  // evalを使用してTypeScriptのオブジェクトリテラルを評価
  // セキュリティ上の懸念があるが、ローカルスクリプトなので許容
  const evalCode = `(${match[1]})`;
  iconsArray = eval(evalCode);
} catch (error) {
  console.error("配列の評価エラー:", error);
  process.exit(1);
}

console.log(`${iconsArray.length}個のアイコンを処理します`);

// 新しいアイコンデータ配列
const newIconsData = [];
let processedCount = 0;
let errorCount = 0;

// 各アイコンを処理
iconsArray.forEach((icon, index) => {
  try {
    const newIcon = {
      account: icon.account,
      url: icon.url,
    };

    // メイン画像データを処理
    if (icon.data) {
      const base64Match = icon.data.match(
        /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/,
      );
      if (base64Match) {
        const extension = base64Match[1] === "jpeg" ? "jpg" : base64Match[1];
        const base64Data = base64Match[2];
        const imageBuffer = Buffer.from(base64Data, "base64");

        // ファイル名を生成（アカウント名を使用）
        const filename = `${icon.account}.${extension}`;
        const filepath = path.join(outputDir, filename);

        // ファイルに保存
        fs.writeFileSync(filepath, imageBuffer);

        // 新しいパスを設定
        newIcon.dataPath = `/images/sprites/icons/${filename}`;
        console.log(`✓ ${icon.account} - メイン画像を保存: ${filename}`);
      }
    }

    // QRコード画像データを処理
    if (icon.qr) {
      const qrMatch = icon.qr.match(
        /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/,
      );
      if (qrMatch) {
        const extension = qrMatch[1] === "jpeg" ? "jpg" : qrMatch[1];
        const base64Data = qrMatch[2];
        const imageBuffer = Buffer.from(base64Data, "base64");

        // ファイル名を生成
        const filename = `${icon.account}.${extension}`;
        const filepath = path.join(outputQrDir, filename);

        // ファイルに保存
        fs.writeFileSync(filepath, imageBuffer);

        // 新しいパスを設定
        newIcon.qrPath = `/images/sprites/qr/${filename}`;
        console.log(`✓ ${icon.account} - QR画像を保存: ${filename}`);
      }
    }

    newIconsData.push(newIcon);
    processedCount++;
  } catch (error) {
    console.error(
      `✗ エラー: アイコン ${index} (${icon.account || "unknown"}):`,
      error.message,
    );
    errorCount++;
  }
});

// handwritings画像をコピー
console.log("\nhandwritings画像をコピー中...");
if (fs.existsSync(handwritingsSourceDir)) {
  const handwritingFiles = fs
    .readdirSync(handwritingsSourceDir)
    .filter((file) => file.endsWith(".png"))
    .sort((a, b) => {
      const numA = parseInt(a.replace(".png", ""));
      const numB = parseInt(b.replace(".png", ""));
      return numA - numB;
    });

  handwritingFiles.forEach((file, index) => {
    const sourcePath = path.join(handwritingsSourceDir, file);
    const destPath = path.join(outputHandwritingsDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ handwriting画像をコピー: ${file}`);

    // icons-data.jsonに追加
    const iconIndex = parseInt(file.replace(".png", "")) - 1;
    if (newIconsData[iconIndex]) {
      newIconsData[iconIndex].handwritingPath =
        `/images/sprites/handwritings/${file}`;
    }
  });
} else {
  console.log("handwritingsディレクトリが見つかりません");
}

// JSONファイルとして保存
fs.writeFileSync(outputJsonPath, JSON.stringify(newIconsData, null, 2));

// 新しいicons.tsファイルを生成
const newIconsTs = `import { Icon } from "../../../../common/_interface";
import iconsData from "./icons-data.json";

// 画像データはpublicフォルダから読み込むように変更
export const icons: Icon[] = iconsData.map(icon => ({
  account: icon.account,
  url: icon.url,
  dataPath: icon.dataPath,
  qrPath: icon.qrPath
}));
`;

const newIconsTsPath = path.join(__dirname, "../src/app/bg/icons-new.ts");
fs.writeFileSync(newIconsTsPath, newIconsTs);

console.log("\n========================================");
console.log("処理完了:");
console.log(`✓ ${processedCount}個のアイコンを正常に処理`);
if (errorCount > 0) {
  console.log(`✗ ${errorCount}個のエラー`);
}
console.log(`\n出力先:`);
console.log(`- 画像: ${outputDir}`);
console.log(`- QR: ${outputQrDir}`);
console.log(`- JSON: ${outputJsonPath}`);
console.log(`- 新しいTypeScript: ${newIconsTsPath}`);

console.log("========================================");
