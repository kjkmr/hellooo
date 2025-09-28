# 画像最適化スクリプト

## 概要
このディレクトリには、PixiJS背景アニメーションの画像データを最適化するためのスクリプトが含まれています。

## スクリプト一覧と役割

### メインスクリプト
#### `index.js`
**役割**: 画像最適化パイプライン全体を自動実行するオーケストレータ
- `extract-icons-to-webp.js`と`create-separate-spritesheets.js`を順次実行
- エラーハンドリングと前提条件チェック
- 進捗状況のレポート
- オプション: `--cleanup`で元画像削除、`--skip-sprite`でスプライトシート生成スキップ

### 個別スクリプト
#### 1. `extract-icons-to-webp.js`
**役割**: base64エンコードされた画像データを個別の画像ファイルに抽出
- `icons.backup.ts`からbase64データを抽出
- アイコン画像、QRコード画像、手書き画像を`public/images/sprites/`以下の別々のディレクトリに保存
- メタデータをJSONファイルに出力

### 2. `convert-to-webp.js`
**役割**: 抽出した画像をWebP形式に変換して軽量化
- JPG/PNG画像をWebP形式に変換（約20-30%のサイズ削減）
- 画像品質を保ちながらファイルサイズを最適化
- 変換後のパス情報を自動更新

### 3. `create-spritesheet.js`
**役割**: アイコンとQRコードを1つのスプライトシートにまとめる（基本版）
- 個別の画像ファイルを1枚のスプライトシートに統合
- テクスチャアトラスの座標情報を生成
- 最大2048x2048pxのテクスチャサイズ制限

### 4. `create-unified-spritesheet.js`
**役割**: 複数のスプライトシートを生成（大量画像対応版）
- アイコンとQRコードを複数のスプライトシートに分割
- 個別ファイルの削除オプション付き（--cleanup）
- より柔軟な画像管理が可能

### 5. `create-separate-spritesheets.js`
**役割**: 画像タイプ別に専用スプライトシートを生成（推奨）
- アイコン、QRコード、手書き画像を別々のスプライトシートに
- 各画像タイプに最適化されたレイアウト
- 最大4096x4096pxまでサポート

## 実行順序とワークフロー

### 基本的なワークフロー（個別ファイル方式）
```bash
1. node scripts/extract-icons-to-webp.js     # base64から画像を抽出
2. node scripts/convert-to-webp.js           # WebP形式に変換（オプション）
```

### スプライトシート方式（パフォーマンス最適化）
```bash
1. node scripts/extract-icons-to-webp.js             # base64から画像を抽出
2. node scripts/create-separate-spritesheets.js      # スプライトシート生成
3. node scripts/create-separate-spritesheets.js -c   # 元画像を削除（オプション）
```

### 選択基準
- **個別ファイル方式**: 画像の追加・更新が頻繁な場合
- **スプライトシート方式**: 本番環境でのパフォーマンスを重視する場合

## 問題点
- `src/app/bg/icons.ts`に462KB以上のbase64エンコードされた画像データが直接埋め込まれている
- これによりバンドルサイズが大きくなり、初期読み込みが遅くなる

## 解決策
1. base64画像データを外部ファイルに抽出
2. WebP形式に変換して軽量化
3. スプライトシート化でHTTPリクエスト数を削減
4. 動的読み込みで必要時のみロード

## 使用方法

### 詳細な使用方法

#### 1. 画像データの抽出
```bash
# icons.backup.tsからbase64画像を抽出してファイルに保存
node scripts/extract-icons-to-webp.js
```

このスクリプトは以下を実行します：
- `icons.backup.ts`からbase64データを抽出
- `public/images/sprites/icons/`にメイン画像を保存
- `public/images/sprites/qr/`にQRコード画像を保存
- `public/images/sprites/handwritings/`に手書き画像を保存
- `src/app/bg/icons-data.json`にメタデータを保存
- `src/app/bg/icons-new.ts`に新しいTypeScriptファイルを生成

#### 2. WebP形式への変換（オプション）
```bash
# WebPをインストール（まだの場合）
brew install webp  # macOS
# または
sudo apt-get install webp  # Ubuntu/Debian

# 画像をWebP形式に変換
node scripts/convert-to-webp.js
```

このスクリプトは以下を実行します：
- JPG/PNG画像をWebP形式に変換
- `icons-data.json`のパスを更新
- 元の画像は保持（必要に応じて手動削除）

#### 3. スプライトシート生成（オプション）

**基本版（単一スプライトシート）:**
```bash
node scripts/create-spritesheet.js
```

**統合版（複数スプライトシート対応）:**
```bash
node scripts/create-unified-spritesheet.js
# 元画像も残す場合
node scripts/create-unified-spritesheet.js --keep
# 元画像を削除する場合
node scripts/create-unified-spritesheet.js --cleanup
```

**推奨版（タイプ別スプライトシート）:**
```bash
node scripts/create-separate-spritesheets.js
# 元画像を削除する場合
node scripts/create-separate-spritesheets.js --cleanup
```

#### 4. コードの更新
```bash
# 1. 新しいicons.tsを適用
mv src/app/bg/icons-new.ts src/app/bg/icons.ts

# 2. index.tsを最適化版に置き換え
cp src/app/bg/index-optimized.ts src/app/bg/index.ts

# 3. 型定義を更新（必要に応じて）
# common/_interface.tsに以下を追加：
# dataPath?: string;
# qrPath?: string;
```

#### 5. 確認
```bash
# ファイルサイズの確認
du -sh public/images/sprites/icons/
du -sh public/images/sprites/qr/
du -sh public/images/sprites/handwritings/
du -sh src/app/bg/icons.ts  # 大幅に縮小されているはず
```

## 効果
- **バンドルサイズ**: 約460KB → 数KB（99%削減）
- **初期読み込み**: 大幅に高速化
- **画像品質**: WebP変換により20-30%のファイルサイズ削減（品質維持）

## 注意事項
- WebP形式は古いブラウザでサポートされない場合があります
- 必要に応じてフォールバック処理を実装してください
- 画像の品質を調整したい場合は`convert-to-webp.js`の`quality`パラメータを変更してください

## トラブルシューティング
- `cwebp`コマンドが見つからない場合は、WebPツールをインストールしてください
- JSONパースエラーが発生した場合は、`icons.ts`の構文を確認してください
- 画像が表示されない場合は、ブラウザのネットワークタブでパスを確認してください