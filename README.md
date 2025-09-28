# ファイル構成
- web : Webサイト用のデータ
- chrome-extension : Chrome機能拡張のデータ
- common : 上記2つから参照する共通のデータ（用紙テンプレートのデータ）
- _test-data : テスト用のアカウントリスト


# Web
[README](./web/README.md)

# Chrome Extension

## セットアップ

### コマンド
```
nodenv install
npm install
npm run dev
```

### 公開
以下から
https://chrome.google.com/webstore/devconsole/fcf8c08a-b76d-4d86-aff6-e79bbb3c299e

### Chrome拡張のインストール

1. Chromeのアドレスバー右にある拡張アイコンから拡張機能の管理を選択
2. 画面右上の「デベロッパーモード」をOnに
3. 画面左上の「パッケージ化されていない拡張機能を読み込む」を選択
4. distフォルダを選択

参考：https://note.com/cute_echium873/n/n997dcf40b3a1

### テスト
/Webのサイトをローカルで開いた状態で、/_test-data/accounts.txt を画面にドラッグ&ドロップしてください。


# 用紙テンプレートの追加方法

### 定義ファイル追加
1. /common/ 以下に定義ファイルを作成
2. /web/public/template-icons 以下にアイコン画像を配置
