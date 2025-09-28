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
        await this.copy.load();
        await this.cardContainer.load();
        this.app.canvas.classList.add("bg");
        document.body.appendChild(this.app.canvas);
        this.app.stage.addChild(this.cardContainer);
        this.app.stage.addChild(this.copy);
        document.documentElement.classList.add("ready");
        await this.copy.show();

        // デフォルトでスプライトシートを使用する場合
        try {
          const spritesheetData = await import("./spritesheet-data.json");
          await this.setIconsWithSpritesheet(icons, spritesheetData.default);
        } catch (error) {
          // スプライトシートが無い場合は従来のBase64モードにフォールバック
          await this.setIcons(icons);
        }

        this.cardContainer.init();
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
    // WebPサポートを確認
    const supportsWebP = await this.checkWebPSupport();

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
    // iconsの順番をランダムに
    icons = icons.sort(() => Math.random() - 0.5);

    let iconSpriteSheet: Spritesheet;
    let qrSpriteSheet: Spritesheet;
    let handwritingsSpriteSheet: Spritesheet | undefined;

    // スプライトシートモード
    if (options?.iconSpritePath && options?.qrSpritePath) {
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
        }

        // スプライトシートを解析
        const parsePromises = [iconSpriteSheet.parse(), qrSpriteSheet.parse()];
        if (handwritingsSpriteSheet) {
          parsePromises.push(handwritingsSpriteSheet.parse());
        }
        await Promise.all(parsePromises);
      } catch (error) {
        console.error("スプライトシート読み込みエラー:", error);
        return this.setIconsBase64(icons);
      }
    } else {
      // Base64モード（従来の実装）
      return this.setIconsBase64(icons, label1Text, label2Text);
    }

    // CardContainerにスプライトシートを渡す
    this.cardContainer.setIcons(
      icons,
      iconSpriteSheet!,
      qrSpriteSheet!,
      handwritingsSpriteSheet,
      label1Text,
      label2Text,
    );
  }

  /**
   * Base64データからスプライトシートを生成（従来の実装）
   */
  private async setIconsBase64(
    icons: Icon[],
    label1Text?: string,
    label2Text?: string,
  ) {
    // データが空の場合はスキップ
    const validIcons = icons.filter((icon) => icon.data && icon.data !== "");
    if (validIcons.length === 0) {
      console.warn("有効なBase64データを持つアイコンがありません");
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
    await iconSpriteSheet.parse();
    await qrSpriteSheet.parse();

    this.cardContainer.setIcons(
      validIcons,
      iconSpriteSheet,
      qrSpriteSheet,
      undefined,
      label1Text,
      label2Text,
    );
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
