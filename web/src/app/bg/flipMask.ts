import { Container, Graphics, Point, Text } from "pixi.js";
import { gsap } from "gsap";
import CardBg from "./cardBg";

export class FlipMask extends Graphics {
  protected _width: number;
  protected _height: number;
  protected _flipAngle: number = Math.PI * -0.5;
  protected _flipPosition: number = 0;
  protected _lastDrawnAngle: number = NaN;
  protected _lastDrawnPosition: number = NaN;

  get flipAngle() {
    return this._flipAngle;
  }

  set flipAngle(angle: number) {
    this._flipAngle = angle;
    this.drawIfNeeded();
  }

  get flipPosition() {
    return this._flipPosition;
  }
  set flipPosition(position: number) {
    this._flipPosition = position;
    this.drawIfNeeded();
  }

  /**
   * コンストラクタ
   */
  constructor(width: number, height: number) {
    super();
    this._width = width;
    this._height = height;
    this.draw();
  }

  drawIfNeeded() {
    // 前回の描画から値が変わっていない場合はスキップ
    if (
      this._flipAngle === this._lastDrawnAngle &&
      this._flipPosition === this._lastDrawnPosition
    ) {
      return;
    }
    this.draw();
    this._lastDrawnAngle = this._flipAngle;
    this._lastDrawnPosition = this._flipPosition;
  }

  draw() {
    const w = this._width;
    const h = this._height;
    const maskPoint = new Point(w * this.flipPosition, h * this.flipPosition);
    // maskPointにmaskAngleの角度の線を引いたときに矩形の上辺と交わる点
    const rightTop = new Point(
      maskPoint.x + Math.tan(this._flipAngle + Math.PI) * maskPoint.y,
      0,
    );
    // maskPointにmaskAngleの角度の線を引いたときに矩形の下辺と交わる点
    const rightBottom = new Point(
      maskPoint.x - Math.tan(this._flipAngle + Math.PI) * (h - maskPoint.y),
      h,
    );

    this.clear();
    this.moveTo(0, 0);
    this.lineTo(rightTop.x, rightTop.y);
    this.lineTo(rightBottom.x, rightBottom.y);
    if (rightBottom.y == h) this.lineTo(0, h);
    this.lineTo(0, 0);
    this.fill({ color: 0x000000, alpha: 0.25 });

    this.moveTo(-w, -w);
    this.lineTo(w, -w);
    this.lineTo(w, 0);
    this.lineTo(0, 0);
    this.lineTo(0, h);
    this.lineTo(-w, h);
    this.lineTo(-w, -w);
    this.fill({ color: 0x000000, alpha: 0.25 });
  }
}
