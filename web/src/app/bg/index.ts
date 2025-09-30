import { Application, Spritesheet, Texture, Assets } from "pixi.js";
import CardContainer from "./cardContainer";
import { Icon } from "../../../../common/_interface";
import { Copy } from "./copy";
import EventEmitter from "events";
import { icons } from "./icons";

// スプライトシート設定の型定義
interface SpritesheetOptions {
  iconSpritePath?: string;
  qrSpritePath?: string;
  handwritingsSpritePath?: string;
  iconSpriteData?: any;
  qrSpriteData?: any;
  handwritingsSpriteData?: any;
}

export class Bg extends EventEmitter {
  // Singleton
  static instance: Bg;
  static init() {
    if (!Bg.instance) Bg.instance = new Bg();
    return Bg.instance;
  }
  static getInstance() {
    return Bg.instance;
  }

  // Instance
  app: Application;
  cardContainer: CardContainer;
  copy: Copy;

  /**
   * コンストラクタ
   */
  constructor() {
    super();
    this.app = new Application();
    this.cardContainer = new CardContainer();
    this.copy = new Copy();
    this.copy.on("create-button-click", () => {
      this.emit("create-button-click");
    });
    console.log("[Bg] Application initialization started");
    this.app
      .init({
        background: "#f5f5f5",
        resizeTo: window,
        resolution: window.devicePixelRatio || 1,
        antialias: true,
        preferWebGLVersion: 2,
        powerPreference: "high-performance",
      })
      .then(async () => {
        console.log("[Bg] Application initialized successfully");
        console.log("[Bg] Loading copy and cardContainer...");
        await this.copy.load();
        await this.cardContainer.load();
        console.log("[Bg] Copy and cardContainer loaded");
        this.app.canvas.classList.add("bg");
        document.body.appendChild(this.app.canvas);
        console.log("[Bg] Canvas appended to body");
        this.app.stage.addChild(this.cardContainer);
        this.app.stage.addChild(this.copy);
        document.documentElement.classList.add("ready");
        console.log("[Bg] Copy showing...");
        await this.copy.show();
        console.log("[Bg] Copy shown");

        // デフォルトでスプライトシートを使用する場合
        try {
          console.log("[Bg] Loading spritesheet data...");
          const spritesheetData = await import("./spritesheet-data.json");
          console.log("[Bg] Spritesheet data loaded, setting icons with spritesheet");
          await this.setIconsWithSpritesheet(icons, spritesheetData.default);
          console.log("[Bg] Icons set with spritesheet successfully");
        } catch (error) {
          console.error("[Bg] Failed to load spritesheet, falling back to Base64 mode:", error);
          // スプライトシートが無い場合は従来のBase64モードにフォールバック
          await this.setIcons(icons);
        }

        console.log("[Bg] Initializing cardContainer");
        this.cardContainer.init();
        console.log("[Bg] Initialization complete");
      });
  }

  /**
   * インタラクティブモード
   */
  setInteractive(interactive: boolean) {
    this.app.stage.interactiveChildren = interactive;
  }

  /**
   * 完了メッセージ表示
   */
  showThanks() {
    this.copy.showThanks();
  }

  /**
   * スプライトシートを使用してアイコンをセット
   */
  async setIconsWithSpritesheet(icons: Icon[], spritesheetData: any) {
    console.log("[Bg.setIconsWithSpritesheet] Called with", icons.length, "icons");
    // WebPサポートを確認
    const supportsWebP = await this.checkWebPSupport();
    console.log("[Bg.setIconsWithSpritesheet] WebP support:", supportsWebP);

    // スプライトシートのパスを決定
    const iconSpritePath =
      supportsWebP && spritesheetData.icons?.meta.imageWebp
        ? spritesheetData.icons.meta.imageWebp
        : spritesheetData.icons?.meta.image;

    const qrSpritePath =
      supportsWebP && spritesheetData.qr?.meta.imageWebp
        ? spritesheetData.qr.meta.imageWebp
        : spritesheetData.qr?.meta.image;

    // handwritingsは省略可能
    const handwritingsSpritePath =
      supportsWebP && spritesheetData.handwritings?.meta.imageWebp
        ? spritesheetData.handwritings.meta.imageWebp
        : spritesheetData.handwritings?.meta.image;

    console.log("[Bg.setIconsWithSpritesheet] Paths:", {
      iconSpritePath,
      qrSpritePath,
      handwritingsSpritePath,
    });

    if (!iconSpritePath || !qrSpritePath) {
      console.warn(
        "スプライトシートのパスが見つかりません。Base64モードにフォールバック",
      );
      return this.setIcons(icons);
    }

    // オプションを設定してsetIconsを呼び出し
    const options: SpritesheetOptions = {
      iconSpritePath,
      qrSpritePath,
      iconSpriteData: spritesheetData.icons,
      qrSpriteData: spritesheetData.qr,
    };

    // handwritingsがある場合のみ追加
    if (handwritingsSpritePath) {
      options.handwritingsSpritePath = handwritingsSpritePath;
      options.handwritingsSpriteData = spritesheetData.handwritings;
    }

    console.log("[Bg.setIconsWithSpritesheet] Calling setIcons with spritesheet options");
    return this.setIcons(icons, options);
  }

  /**
   * アイコンデータをセット（Base64とスプライトシートの両方に対応）
   * @param icons アイコンデータ配列
   * @param options スプライトシートオプション（省略時はBase64モード）
   */
  async setIcons(
    icons: Icon[],
    options?: SpritesheetOptions,
    label1Text: string = "Company",
    label2Text: string = "Name",
  ) {
    console.log("[Bg.setIcons] Called with", icons.length, "icons, mode:", options ? "spritesheet" : "base64");
    // iconsの順番をランダムに
    icons = icons.sort(() => Math.random() - 0.5);
    console.log("[Bg.setIcons] Icons randomized");

    let iconSpriteSheet: Spritesheet;
    let qrSpriteSheet: Spritesheet;
    let handwritingsSpriteSheet: Spritesheet | undefined;

    // スプライトシートモード
    if (options?.iconSpritePath && options?.qrSpritePath) {
      console.log("[Bg.setIcons] Spritesheet mode - loading textures");
      try {
        // 必須のスプライトシートテクスチャを読み込み
        const textures = await Promise.all([
          Assets.load(options.iconSpritePath),
          Assets.load(options.qrSpritePath),
          // handwritingsは省略可能
          options.handwritingsSpritePath
            ? Assets.load(options.handwritingsSpritePath)
            : Promise.resolve(null),
        ]);
        console.log("[Bg.setIcons] Textures loaded");

        const [iconTexture, qrTexture, handwritingsTexture] = textures;

        // Spritesheetオブジェクトを作成
        iconSpriteSheet = new Spritesheet(iconTexture, {
          frames: options.iconSpriteData.frames,
          meta: options.iconSpriteData.meta,
        });

        qrSpriteSheet = new Spritesheet(qrTexture, {
          frames: options.qrSpriteData.frames,
          meta: options.qrSpriteData.meta,
        });

        // handwritingsがある場合のみ作成
        if (handwritingsTexture && options.handwritingsSpriteData) {
          handwritingsSpriteSheet = new Spritesheet(handwritingsTexture, {
            frames: options.handwritingsSpriteData.frames,
            meta: options.handwritingsSpriteData.meta,
          });
          console.log("[Bg.setIcons] Handwritings spritesheet created");
        }

        // スプライトシートを解析
        console.log("[Bg.setIcons] Parsing spritesheets...");
        const parsePromises = [iconSpriteSheet.parse(), qrSpriteSheet.parse()];
        if (handwritingsSpriteSheet) {
          parsePromises.push(handwritingsSpriteSheet.parse());
        }
        await Promise.all(parsePromises);
        console.log("[Bg.setIcons] Spritesheets parsed successfully");
      } catch (error) {
        console.error("[Bg.setIcons] スプライトシート読み込みエラー:", error);
        return this.setIconsBase64(icons);
      }
    } else {
      console.log("[Bg.setIcons] Base64 mode - delegating to setIconsBase64");
      // Base64モード(従来の実装)
      return this.setIconsBase64(icons, label1Text, label2Text);
    }

    // CardContainerにスプライトシートを渡す
    console.log("[Bg.setIcons] Calling cardContainer.setIcons with", icons.length, "icons");
    this.cardContainer.setIcons(
      icons,
      iconSpriteSheet!,
      qrSpriteSheet!,
      handwritingsSpriteSheet,
      label1Text,
      label2Text,
    );
    console.log("[Bg.setIcons] Complete");
  }

  /**
   * Base64データからスプライトシートを生成（従来の実装）
   */
  private async setIconsBase64(
    icons: Icon[],
    label1Text?: string,
    label2Text?: string,
  ) {
    console.log("[Bg.setIconsBase64] Called with", icons.length, "icons");
    // データが空の場合はスキップ
    const validIcons = icons.filter((icon) => icon.data && icon.data !== "");
    console.log("[Bg.setIconsBase64] Valid icons:", validIcons.length);
    if (validIcons.length === 0) {
      console.warn("[Bg.setIconsBase64] 有効なBase64データを持つアイコンがありません");
      return;
    }

    // アイコンを1つのキャンバスにスプライトシート化して描画
    const offset = 2;
    const iconCanvas = document.createElement("canvas");
    const qrCanvas = document.createElement("canvas");
    const iconSize = 70 * 2;
    const maxCanvasSize = 2048;
    const maxNumCols = Math.floor(maxCanvasSize / (iconSize + offset));
    const numCols = Math.min(validIcons.length, maxNumCols);
    const numRows = Math.ceil(validIcons.length / numCols);
    iconCanvas.width = (iconSize + offset) * numCols;
    iconCanvas.height = (iconSize + offset) * numRows;
    qrCanvas.width = (iconSize + offset) * numCols;
    qrCanvas.height = (iconSize + offset) * numRows;
    const iconCtx = iconCanvas.getContext("2d")!;
    const qrCtx = qrCanvas.getContext("2d")!;

    for (let i = 0; i < validIcons.length; i++) {
      const col = i % numCols;
      const row = Math.floor(i / numCols);

      // アイコン画像
      if (validIcons[i]!.data) {
        const iconImg = new Image();
        await new Promise<void>((resolve) => {
          iconImg.addEventListener("load", () => resolve());
          iconImg.addEventListener("error", () => resolve()); // エラーでも続行
          iconImg.src = validIcons[i]!.data;
        });
        if (iconImg.complete && iconImg.naturalWidth > 0) {
          iconCtx.drawImage(
            iconImg,
            col * (iconSize + offset),
            row * (iconSize + offset),
            iconSize,
            iconSize,
          );
        }
      }

      // QR画像
      if (validIcons[i]!.qr) {
        const qrImg = new Image();
        await new Promise<void>((resolve) => {
          qrImg.addEventListener("load", () => resolve());
          qrImg.addEventListener("error", () => resolve()); // エラーでも続行
          qrImg.src = validIcons[i]!.qr!;
        });
        if (qrImg.complete && qrImg.naturalWidth > 0) {
          qrCtx.drawImage(
            qrImg,
            col * (iconSize + offset),
            row * (iconSize + offset),
            iconSize,
            iconSize,
          );
        }
      }
    }

    const iconTexture = Texture.from(iconCanvas);
    const qrTexture = Texture.from(qrCanvas);

    // テクスチャーのフレーム作成
    const frames: {
      [key: string]: {
        frame: { x: number; y: number; w: number; h: number };
        sourceSize: { w: number; h: number };
        spriteSourceSize: { x: number; y: number; w: number; h: number };
      };
    } = {};

    for (let i = 0; i < validIcons.length; i++) {
      const col = i % numCols;
      const row = Math.floor(i / numCols);
      frames[validIcons[i]!.account] = {
        frame: {
          x: col * (iconSize + offset),
          y: row * (iconSize + offset),
          w: iconSize,
          h: iconSize,
        },
        sourceSize: { w: iconSize, h: iconSize },
        spriteSourceSize: { x: 0, y: 0, w: iconSize, h: iconSize },
      };
    }

    const atlasData = {
      frames,
      meta: {
        size: { w: iconCanvas.width, h: iconCanvas.height },
        scale: 1,
      },
    };

    const iconSpriteSheet = new Spritesheet(iconTexture, atlasData);
    const qrSpriteSheet = new Spritesheet(qrTexture, atlasData);
    console.log("[Bg.setIconsBase64] Parsing spritesheets...");
    await iconSpriteSheet.parse();
    await qrSpriteSheet.parse();
    console.log("[Bg.setIconsBase64] Spritesheets parsed, calling cardContainer.setIcons");

    this.cardContainer.setIcons(
      validIcons,
      iconSpriteSheet,
      qrSpriteSheet,
      undefined,
      label1Text,
      label2Text,
    );
    console.log("[Bg.setIconsBase64] Complete");
  }

  /**
   * WebPサポートを確認
   */
  private checkWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = function () {
        resolve(webP.height === 2);
      };
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
  }
}
