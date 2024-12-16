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
  iconTexture?: Texture;
  qrTexture?: Texture;

  /**
   * コンストラクタ
   */
  constructor() {
    super();
  }

  async load() {
    this.iconTexture = await Assets.load("/images/icon.jpg");
    this.qrTexture = await Assets.load("/images/qr.png");
    this.addChild(this.container);
  }
  async init() {
    this.rotation = 15 * (Math.PI / 180);
    this._onResize();
    window.addEventListener("resize", this.onResize);
  }

  setIcons(
    icons: Icon[],
    iconSpriteSheet: Spritesheet,
    qrSpriteSheet: Spritesheet,
  ) {
    this.icons = icons;
    if (this.iconSpriteSheet) {
      this.iconSpriteSheet.textureSource.destroy();
      this.iconSpriteSheet.destroy();
    }
    if (this.qrSpriteSheet) {
      this.qrSpriteSheet.textureSource.destroy();
      this.qrSpriteSheet.destroy();
    }
    this.iconSpriteSheet = iconSpriteSheet;
    this.qrSpriteSheet = qrSpriteSheet;
    this._onResize();
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
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const margin = 10;
    const areaRatio = isSpLayout() ? 1 : 0.5;
    const numColumns = Math.ceil((ww * areaRatio) / (CardBg.WIDTH + margin));

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
      } else if (this.columns.length > numColumns) {
        const column = this.columns.pop()!;
        column.destroy();
        this.container.removeChild(column);
      } else {
        break;
      }
      // break; // TODO
    }

    this.columns.forEach((column, i) => {
      if (this.icons.length && this.iconSpriteSheet && this.qrSpriteSheet) {
        column.setIcons(this.icons, this.iconSpriteSheet, this.qrSpriteSheet);
      }
      column.reset(i);
    });
    this.x = window.innerWidth * (1 - areaRatio) + 60;
    if (isSpLayout()) this.x -= window.innerWidth * 0.5;
    // else this.x += 60;

    this.y = window.innerHeight / 2;
    this.container.y = -this.y;
  };
}
