#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 画像最適化パイプラインを開始します...\n');
console.log('========================================');

// スクリプトのパス
const extractScript = path.join(__dirname, 'extract-icons-to-webp.js');
const spritesheetScript = path.join(__dirname, 'create-separate-spritesheets.js');

// コマンドライン引数を取得
const args = process.argv.slice(2);
const shouldCleanup = args.includes('--cleanup') || args.includes('-c');
const skipSpritesheet = args.includes('--skip-sprite') || args.includes('-s');
const helpRequested = args.includes('--help') || args.includes('-h');

// ヘルプメッセージを表示
if (helpRequested) {
  console.log('使用方法: node scripts/index.js [オプション]\n');
  console.log('オプション:');
  console.log('  --cleanup, -c      スプライトシート生成後に元画像を削除');
  console.log('  --skip-sprite, -s  スプライトシート生成をスキップ（画像抽出のみ）');
  console.log('  --help, -h         このヘルプメッセージを表示');
  console.log('\n例:');
  console.log('  node scripts/index.js                  # 基本実行');
  console.log('  node scripts/index.js --cleanup        # クリーンアップ付き実行');
  console.log('  node scripts/index.js --skip-sprite    # 画像抽出のみ');
  process.exit(0);
}

/**
 * スクリプトを実行する関数
 */
function runScript(scriptPath, scriptArgs = []) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 実行中: ${path.basename(scriptPath)}`);
    console.log('----------------------------------------');

    const child = spawn('node', [scriptPath, ...scriptArgs], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${path.basename(scriptPath)} がエラーコード ${code} で終了しました`));
      } else {
        resolve();
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * バックアップファイルの存在を確認
 */
function checkBackupFile() {
  const backupPath = path.join(__dirname, '../src/app/bg/icons.backup.ts');
  if (!fs.existsSync(backupPath)) {
    console.error('❌ エラー: icons.backup.ts が見つかりません');
    console.log('\n以下のいずれかの方法で準備してください:');
    console.log('1. icons.ts をバックアップ: cp src/app/bg/icons.ts src/app/bg/icons.backup.ts');
    console.log('2. 既存のバックアップファイルを配置');
    return false;
  }
  return true;
}

/**
 * canvasパッケージの確認
 */
function checkCanvasPackage() {
  try {
    require.resolve('canvas');
    return true;
  } catch (e) {
    console.warn('⚠️  警告: canvasパッケージがインストールされていません');
    console.log('スプライトシート生成にはcanvasが必要です:');
    console.log('  npm install --save-dev canvas');
    console.log('\n画像抽出のみ実行します...');
    return false;
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    // バックアップファイルの確認
    if (!checkBackupFile()) {
      process.exit(1);
    }

    // ステップ1: 画像の抽出
    console.log('\n🎯 ステップ 1/2: Base64画像の抽出');
    await runScript(extractScript);

    // スプライトシート生成をスキップする場合
    if (skipSpritesheet) {
      console.log('\n✅ 画像抽出完了（スプライトシート生成はスキップされました）');
      return;
    }

    // canvasパッケージの確認
    const hasCanvas = checkCanvasPackage();
    if (!hasCanvas) {
      console.log('\n✅ 画像抽出完了（canvasが必要なためスプライトシート生成はスキップ）');
      return;
    }

    // ステップ2: スプライトシート生成
    console.log('\n🎯 ステップ 2/2: スプライトシート生成');
    const spritesheetArgs = shouldCleanup ? ['--cleanup'] : [];
    await runScript(spritesheetScript, spritesheetArgs);

    // 完了メッセージ
    console.log('\n========================================');
    console.log('✅ すべての処理が完了しました！');
    console.log('========================================');

    // 出力ディレクトリの情報を表示
    const outputDirs = [
      'public/images/sprites/icons',
      'public/images/sprites/qr',
      'public/images/sprites/handwritings',
      'public/images/sprites'
    ];

    console.log('\n📁 出力ディレクトリ:');
    outputDirs.forEach(dir => {
      const fullPath = path.join(__dirname, '..', dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        const imageFiles = files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
        if (imageFiles.length > 0) {
          console.log(`  ${dir}: ${imageFiles.length}ファイル`);
        }
      }
    });

    console.log('\n次のステップ:');
    console.log('1. 生成されたファイルを確認');
    console.log('2. src/app/bg/index.tsを更新してスプライトシートを使用');
    console.log('3. アプリケーションで動作確認');

    if (shouldCleanup) {
      console.log('\n✨ 元画像ファイルは削除されました');
    }

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// 実行
main();