import { Text } from "pixi.js";
import TypewriterText from "./typewriterText";

export default class CardLabelText extends TypewriterText {
  /**
   * コンストラクタ
   */
  constructor(text: string, x: number, y: number) {
    super(
      {
        style: {
          fontFamily: "sans-serif",
          letterSpacing: 0.5,
          fontSize: 7,
        },
      },
      text,
    );
    this.x = x;
    this.y = y;
  }
}
