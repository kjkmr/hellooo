import { Container, Renderer, Spritesheet, Texture } from "pixi.js";
import CardBg from "./cardBg";
import Card from "./card";
import { Icon } from "../../../../common/_interface";

/**
 * カード一列分のコンテナ
 */
export default class CardColumnContainer extends Container {
  cards: Card[] = [];
  index: number;
  direction: number = 1;
  scroll: number = 0;
  scrollSpeed: number = 0.003;
  requestAnimationFrameId: number = 0;
  iconTexture: Texture;
  qrTexture: Texture;
  icons: Icon[] = [];
  iconSpriteSheet?: Spritesheet;
  qrSpriteSheet?: Spritesheet;
  handwritingsSpriteSheet?: Spritesheet;
  label1Text?: string;
  label2Text?: string;

  /**
   * コンストラクタ
   */
  constructor(
    index: number,
    direction: number,
    iconTexture: Texture,
    qrTexture: Texture,
  ) {
    super();
    this.index = index;
    this.direction = direction;
    this.iconTexture = iconTexture;
    this.qrTexture = qrTexture;
    this.update();
  }

  /**
   * 更新
   */
  update = () => {
    // return; // TODO: デバッグ用
    this.scroll += this.scrollSpeed * this.direction;
    const margin = 10;
    const maxScroll = (CardBg.HEIGHT + margin) * this.cards.length;
    this.cards.forEach((card, y) => {
      if (this.scroll > 0) {
        card.y =
          (((y + this.scroll) % this.cards.length) - 2) *
          (CardBg.HEIGHT + margin);
      } else {
        let y_ = y + this.scroll;
        while (y_ < 0) y_ += this.cards.length;
        y_ -= 2;
        card.y = y_ * (CardBg.HEIGHT + margin);
      }
    });
    this.requestAnimationFrameId = window.requestAnimationFrame(this.update);
  };

  /**
   * 破棄
   */
  destroy() {
    window.cancelAnimationFrame(this.requestAnimationFrameId);
    super.destroy();
  }

  /**
   *
   * @param icons
   */
  setIcons(
    icons: Icon[],
    iconSpriteSheet: Spritesheet,
    qrSpriteSheet: Spritesheet,
    handwritingsSpriteSheet?: Spritesheet,
    label1Text?: string,
    label2Text?: string,
  ) {
    console.log("[CardColumnContainer.setIcons] Column", this.index, "- received", icons.length, "icons");
    this.icons = icons;
    this.iconSpriteSheet = iconSpriteSheet;
    this.qrSpriteSheet = qrSpriteSheet;
    this.handwritingsSpriteSheet = handwritingsSpriteSheet;
    if (label1Text) this.label1Text = label1Text;
    if (label2Text) this.label2Text = label2Text;
    console.log("[CardColumnContainer.setIcons] Column", this.index, "- icons set");
  }

  /**
   * カードを再生成
   */
  reset = (index: number) => {
    console.log("[CardColumnContainer.reset] Column", this.index, "- resetting with", this.icons.length, "icons");
    this.scroll = 0;
    const wh = window.innerHeight;

    // いったん全てのカードを削除
    this.cards.forEach((card) => this.removeChild(card));
    this.cards = [];
    console.log("[CardColumnContainer.reset] Column", this.index, "- cleared existing cards");

    // カードを再生成
    const margin = 10;
    const numRows = Math.ceil(wh / (CardBg.HEIGHT + margin)) + 2;
    console.log("[CardColumnContainer.reset] Column", this.index, "- creating", numRows, "cards");
    // const numRows = 1; // TODO: デバッグ用
    const iconOffset = numRows * this.index;

    for (let y = 0; y < numRows; y++) {
      const icon = this.icons[(y + iconOffset) % this.icons.length];
      const iconTexture =
        (icon && this.iconSpriteSheet?.textures[icon.account]) ||
        this.iconTexture;
      const qrTexture =
        (icon && this.qrSpriteSheet?.textures[icon.account]) || this.qrTexture;

      // handwritingテクスチャを取得（アカウント名で）
      const handwritingTexture =
        icon && this.handwritingsSpriteSheet?.textures[icon.account];

      console.log("[CardColumnContainer.reset] Column", this.index, "Card", y, "- icon:", icon?.account, "textures:", {
        icon: !!iconTexture,
        qr: !!qrTexture,
        handwriting: !!handwritingTexture,
      });

      const card = new Card(
        icon || null,
        iconTexture,
        qrTexture,
        handwritingTexture,
        this.label1Text,
        this.label2Text,
      );
      const delay =
        (this.direction > 0 ? y : numRows - y) * 0.085 + index * 0.085 * 4.5;
      console.log("[CardColumnContainer.reset] Column", this.index, "Card", y, "- calling show with delay", delay);
      card.show(delay);
      this.addChild(card);
      this.cards.push(card);
    }
    console.log("[CardColumnContainer.reset] Column", this.index, "- complete, starting animation");
    window.cancelAnimationFrame(this.requestAnimationFrameId);
    this.update();
  };
}
