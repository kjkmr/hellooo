import { Sprite, Text, Texture } from "pixi.js";
import CardBg from "./cardBg";
import { COLORS } from "./constants";
import gsap from "gsap";
import { animateTint } from "src/utils";

export default class CardSprite extends Sprite {
  /**
   * コンストラクタ
   */
  constructor(x: number, y: number, texture?: Texture) {
    super(texture);
    this.width = this.height = 70;
    this.x = x;
    this.y = y;
    this.tint = 0xffffff;
  }

  async over(delay: number = 0) {
    await animateTint(this, COLORS.orange, 0xffffff, delay, 0.1);
  }
}
