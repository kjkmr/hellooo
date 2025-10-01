import gsap from "gsap";
import { Text, TextOptions } from "pixi.js";
import { animateTint, hexToRgb } from "src/utils";
import { COLORS } from "./constants";

export default class TypewriterText extends Text {
  __text: string;

  /**
   * コンストラクタ
   */
  constructor(options: TextOptions, text = "") {
    options.style = options.style || {};
    options.style.fill = 0xffffff;
    super(options);
    this.__text = text;
    this.tint = 0x000000;
  }

  setText(text: string) {
    this.__text = text;
  }

  /**
   * 表示
   * @param text
   */
  async show(text?: string, framesPerChar = 3) {
    if (text) this.__text = text;
    for (let i = 0; i < this.__text.length; i++) {
      for (let j = 0; j < framesPerChar; j++) {
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
      }
      this.text = this.__text.slice(0, i + 1);
    }
  }

  async over(delay: number = 0) {
    await animateTint(this, COLORS.orange, 0x000000, delay, 0.75, 0.2);
  }
}
