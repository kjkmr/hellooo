import { Application, Spritesheet, Texture, Ticker } from "pixi.js";
import CardContainer from "./cardContainer";
import { Icon } from "../../../../common/_interface";
import { Copy } from "./copy";
import EventEmitter from "events";
import { icons } from "./icons";

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
        this.setIcons(icons);
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
   * アイコンデータをセット
   * @param icons
   */
  async setIcons(icons: Icon[]) {
    // アイコンを1つのキャンバスにスプライトシート化して描画
    const offset = 2;
    const iconCanvas = document.createElement("canvas");
    const qrCanvas = document.createElement("canvas");
    const iconSize = 70 * 2;
    const maxCanvasSize = 2048;
    const maxNumCols = Math.floor(maxCanvasSize / (iconSize + offset)); // 2048 / 140 = 14.6
    const numCols = Math.min(icons.length, maxNumCols);
    const numRows = Math.ceil(icons.length / numCols);
    iconCanvas.width = (iconSize + offset) * numCols;
    iconCanvas.height = (iconSize + offset) * numRows;
    qrCanvas.width = (iconSize + offset) * numCols;
    qrCanvas.height = (iconSize + offset) * numRows;
    const iconCtx = iconCanvas.getContext("2d")!;
    const qrCtx = qrCanvas.getContext("2d")!;
    for (let i = 0; i < icons.length; i++) {
      const col = i % numCols;
      const row = Math.floor(i / numCols);
      const iconImg = new Image();
      await new Promise<void>((resolve) => {
        iconImg.addEventListener("load", () => resolve());
        iconImg.src = icons[i]!.data;
      });
      iconCtx.drawImage(
        iconImg,
        col * (iconSize + offset),
        row * (iconSize + offset),
        iconSize,
        iconSize,
      );
      if (icons[i]!.qr) {
        const qrImg = new Image();
        await new Promise<void>((resolve) => {
          qrImg.addEventListener("load", () => resolve());
          qrImg.src = icons[i]!.qr!;
        });
        qrCtx.drawImage(
          qrImg,
          col * (iconSize + offset),
          row * (iconSize + offset),
          iconSize,
          iconSize,
        );
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

    for (let i = 0; i < icons.length; i++) {
      const col = i % numCols;
      const row = Math.floor(i / numCols);
      frames[icons[i]!.account] = {
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

    this.cardContainer.setIcons(icons, iconSpriteSheet, qrSpriteSheet);
  }
}
