#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 変換対象のディレクトリ
const iconDir = path.join(__dirname, '../public/images/sprites/icons');
const qrDir = path.join(__dirname, '../public/images/sprites/qr');
const handwritingsDir = path.join(__dirname, '../public/images/sprites/handwritings');
const outputJsonPath = path.join(__dirname, '../src/app/bg/icons-data.json');

// cwebpコマンドの存在確認
async function checkWebpSupport() {
  try {
    await execAsync('cwebp -version');
    return true;
  } catch (error) {
    console.error('❌ cwebpコマンドが見つかりません。');
    console.log('\nインストール方法:');
    console.log('macOS: brew install webp');
    console.log('Ubuntu/Debian: sudo apt-get install webp');
    console.log('Windows: https://developers.google.com/speed/webp/download');
    return false;
  }
}

// 画像をWebPに変換
async function convertToWebp(inputPath, outputPath, quality = 80) {
  const command = `cwebp -q ${quality} "${inputPath}" -o "${outputPath}"`;
  try {
    const { stdout, stderr } = await execAsync(command);
    return true;
  } catch (error) {
    console.error(`変換エラー: ${inputPath}`, error.message);
    return false;
  }
}

// ディレクトリ内の画像を変換
async function convertDirectory(dir, type) {
  if (!fs.existsSync(dir)) {
    console.log(`ディレクトリが存在しません: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
  
  console.log(`\n${type}画像の変換を開始: ${imageFiles.length}ファイル`);
  
  let convertedCount = 0;
  let errorCount = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(dir, file);
    const outputFile = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(dir, outputFile);
    
    process.stdout.write(`変換中: ${file} → ${outputFile}...`);
    
    const success = await convertToWebp(inputPath, outputPath);
    
    if (success) {
      // 元のファイルを削除（オプション）
      // fs.unlinkSync(inputPath);
      process.stdout.write(' ✓\n');
      convertedCount++;
    } else {
      process.stdout.write(' ✗\n');
      errorCount++;
    }
  }

  console.log(`完了: ${convertedCount}成功, ${errorCount}エラー`);
  return { convertedCount, errorCount };
}

// JSONファイルを更新
function updateJsonPaths() {
  if (!fs.existsSync(outputJsonPath)) {
    console.log('icons-data.jsonが見つかりません');
    return;
  }

  const iconsData = JSON.parse(fs.readFileSync(outputJsonPath, 'utf8'));
  
  const updatedData = iconsData.map(icon => {
    const newIcon = { ...icon };
    
    // パスをwebpに更新
    if (icon.dataPath) {
      newIcon.dataPath = icon.dataPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    if (icon.qrPath) {
      newIcon.qrPath = icon.qrPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return newIcon;
  });

  fs.writeFileSync(outputJsonPath, JSON.stringify(updatedData, null, 2));
  console.log('\n✓ icons-data.jsonのパスを更新しました');
}

// メイン処理
async function main() {
  console.log('WebP変換スクリプトを開始します...\n');

  // cwebpの確認
  const hasWebp = await checkWebpSupport();
  if (!hasWebp) {
    process.exit(1);
  }

  console.log('✓ cwebpが利用可能です');

  // アイコン画像の変換
  const iconResults = await convertDirectory(iconDir, 'アイコン');

  // QR画像の変換
  const qrResults = await convertDirectory(qrDir, 'QR');

  // 手書き画像の変換
  const handwritingsResults = await convertDirectory(handwritingsDir, '手書き');

  // JSONファイルのパスを更新
  updateJsonPaths();

  console.log('\n========================================');
  console.log('変換完了サマリー:');
  if (iconResults) {
    console.log(`アイコン: ${iconResults.convertedCount}個変換成功`);
  }
  if (qrResults) {
    console.log(`QR: ${qrResults.convertedCount}個変換成功`);
  }
  if (handwritingsResults) {
    console.log(`手書き: ${handwritingsResults.convertedCount}個変換成功`);
  }
  console.log('\n次のステップ:');
  console.log('1. 変換されたWebPファイルを確認');
  console.log('2. 元の画像ファイルを削除（必要に応じて）');
  console.log('3. アプリケーションで新しい画像パスをテスト');
  console.log('========================================');
}

// 実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});