import { Text } from "pixi.js";
import TypewriterText from "./typewriterText";

export default class CardText extends TypewriterText {
  /**
   * コンストラクタ
   */
  constructor(x: number, y: number) {
    super(
      {
        style: {
          fontFamily: "sans-serif",
          fontSize: 22,
        },
      },
      "@hellooo_cards",
    );
    this.x = x;
    this.y = y;
  }
}
