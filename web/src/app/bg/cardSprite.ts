import { Sprite, Text, Texture } from "pixi.js";
import CardBg from "./cardBg";

export default class CardSprite extends Sprite {
  /**
   * コンストラクタ
   */
  constructor(x: number, y: number, texture?: Texture) {
    super(texture);
    this.width = this.height = 70;
    this.x = x;
    this.y = y;
  }
}
