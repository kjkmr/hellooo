import { Text, TextOptions } from "pixi.js";

export default class TypewriterText extends Text {
  __text: string;

  /**
   * コンストラクタ
   */
  constructor(options: TextOptions, text = "") {
    super(options);
    this.__text = text;
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
}
