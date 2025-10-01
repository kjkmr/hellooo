import { Container, Graphics, Text } from "pixi.js";
import { COLORS } from "./constants";

const colors = {
  white: COLORS.white,
  orange: COLORS.orange,
};

export default class CardBg extends Graphics {
  static readonly WIDTH = 350;
  static readonly HEIGHT = 197;
  protected _color: "white" | "orange" = "white";

  /**
   * コンストラクタ
   */
  constructor(color: "white" | "orange" = "white") {
    super();
    this.color = color;
  }

  set color(color: "white" | "orange") {
    this._color = color;
    this.draw();
  }

  get color() {
    return this._color;
  }

  draw() {
    this.clear();
    this.roundRect(0, 0, CardBg.WIDTH, CardBg.HEIGHT, 20);
    this.fill({ color: colors[this.color], alpha: 1 });
  }
}
