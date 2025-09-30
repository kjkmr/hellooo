import { Assets, Container, Graphics, Spritesheet, Texture } from "pixi.js";
import CardBg from "./cardBg";
import CardColumnContainer from "./cardColumnContainer";
import { Icon } from "../../../../common/_interface";
import { isPcChrome, isSpLayout } from "@/components/utils";

/**
 * カード全体のコンテナ
 * columns: CardColumnContainer ->  cards: Card[]
 */
export default class CardContainer extends Container {
  resizeTimer: number = 0;
  container: Container = new Container();
  columns: CardColumnContainer[] = [];
  icons: Icon[] = [];
  iconSpriteSheet?: Spritesheet;
  qrSpriteSheet?: Spritesheet;
  handwritingsSpriteSheet?: Spritesheet;
  iconTexture?: Texture;
  qrTexture?: Texture;
  label1Text?: string;
  label2Text?: string;

  /**
   * コンストラクタ
   */
  constructor() {
    super();
  }

  async load() {
    this.iconTexture = await Assets.load("/images/twitter-icon.png.webp");
    this.qrTexture = await Assets.load("/images/qr.png.webp");
    this.addChild(this.container);
  }
  async init() {
    this.rotation = 15 * (Math.PI / 180);
    window.addEventListener("resize", this.onResize);
  }

  setIcons(
    icons: Icon[],
    iconSpriteSheet: Spritesheet,
    qrSpriteSheet: Spritesheet,
    handwritingsSpriteSheet?: Spritesheet,
    label1Text?: string,
    label2Text?: string,
  ) {
    console.log("[CardContainer.setIcons] Called with", icons.length, "icons");
    this.rotation = 15 * (Math.PI / 180);
    this.icons = icons;
    if (this.iconSpriteSheet) {
      this.iconSpriteSheet.textureSource.destroy();
      this.iconSpriteSheet.destroy();
    }
    if (this.qrSpriteSheet) {
      this.qrSpriteSheet.textureSource.destroy();
      this.qrSpriteSheet.destroy();
    }
    if (this.handwritingsSpriteSheet) {
      this.handwritingsSpriteSheet.textureSource.destroy();
      this.handwritingsSpriteSheet.destroy();
    }
    this.iconSpriteSheet = iconSpriteSheet;
    this.qrSpriteSheet = qrSpriteSheet;
    this.handwritingsSpriteSheet = handwritingsSpriteSheet;
    console.log("[CardContainer.setIcons] Spritesheets set, handwritings:", !!handwritingsSpriteSheet);
    if (label1Text) this.label1Text = label1Text;
    if (label2Text) this.label2Text = label2Text;
    console.log("[CardContainer.setIcons] Calling _onResize");
    this._onResize();
    console.log("[CardContainer.setIcons] Complete");
  }

  /**
   * リサイズイベント
   */
  onResize = () => {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(this._onResize, 200);
  };

  /**
   * 実際のリサイズ処理
   */
  protected _onResize = () => {
    console.log("[CardContainer._onResize] Starting resize");
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const margin = 10;
    const areaRatio = isSpLayout() ? 1 : 0.5;
    const numColumns = Math.ceil((ww * areaRatio) / (CardBg.WIDTH + margin));
    console.log("[CardContainer._onResize] Calculated columns:", numColumns, "current:", this.columns.length);

    while (this.columns.length != numColumns) {
      if (this.columns.length < numColumns) {
        const column = new CardColumnContainer(
          this.columns.length,
          this.columns.length % 2 == 0 ? 1 : -1,
          this.iconTexture!,
          this.qrTexture!,
        );
        column.x = this.columns.length * (CardBg.WIDTH + margin);
        this.container.addChild(column);
        this.columns.push(column);
        console.log("[CardContainer._onResize] Added column", this.columns.length - 1);
      } else if (this.columns.length > numColumns) {
        const column = this.columns.pop()!;
        column.destroy();
        this.container.removeChild(column);
        console.log("[CardContainer._onResize] Removed column");
      } else {
        break;
      }
      // break; // TODO
    }

    console.log("[CardContainer._onResize] Setting icons for", this.columns.length, "columns");
    this.columns.forEach((column, i) => {
      if (this.icons.length && this.iconSpriteSheet && this.qrSpriteSheet) {
        console.log("[CardContainer._onResize] Setting icons for column", i);
        column.setIcons(
          this.icons,
          this.iconSpriteSheet,
          this.qrSpriteSheet,
          this.handwritingsSpriteSheet,
          this.label1Text,
          this.label2Text,
        );
      } else {
        console.log("[CardContainer._onResize] Skipping column", i, "- missing data", {
          icons: this.icons.length,
          iconSpriteSheet: !!this.iconSpriteSheet,
          qrSpriteSheet: !!this.qrSpriteSheet,
        });
      }
      console.log("[CardContainer._onResize] Resetting column", i);
      column.reset(i);
    });
    this.x = window.innerWidth * (1 - areaRatio) + 60;
    if (isSpLayout()) this.x -= window.innerWidth * 0.5;
    // else this.x += 60;

    this.y = window.innerHeight / 2;
    this.container.y = -this.y;
    console.log("[CardContainer._onResize] Complete");
  };
}
