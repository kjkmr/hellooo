import { Container, Graphics, Point } from "pixi.js";
import { FlipMask } from "./flipMask";

const debug = false;

/**
 * 線文p1p2上に点p3から垂線を下ろしたときの交点を求める
 * @param p1
 * @param p2
 * @param p3
 * @returns
 */
function findPerpendicularPoint(p1: Point, p2: Point, p3: Point): Point {
  // A, B, P はそれぞれ { x: 数値, y: 数値 } の形式
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  const { x: px, y: py } = p3;

  // 線分ABの方向ベクトル
  const dx = x2 - x1;
  const dy = y2 - y1;

  // 線分ABの長さの2乗
  const lengthSquared = dx * dx + dy * dy;

  // 線分AB上に点Pを射影した比率tを計算
  const t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;

  // tが[0, 1]の範囲内なら交点は線分AB上にある
  const tClamped = Math.max(0, Math.min(1, t));

  // 射影点（交点p）の座標を計算
  const pxProjection = x1 + tClamped * dx;
  const pyProjection = y1 + tClamped * dy;

  return new Point(pxProjection, pyProjection);
}

export class FlipBackSide extends Container {
  content: Container;
  flipMask: FlipMask;

  protected _flipAngle: number = Math.PI * -0.5;
  protected _flipPosition: number = 0;
  protected _moveVector: Point = new Point();
  protected _lastResetAngle: number = NaN;
  protected _lastResetPosition: number = NaN;

  // Debug
  gp = new Graphics();
  grb = new Graphics();
  grt = new Graphics();
  gwh = new Graphics();
  gb = new Graphics();
  // End Debug

  /**
   * コンストラクタ
   */
  constructor(content: Container) {
    super();
    this.content = content;
    this.content.scale.set(this.content.scale.x, -this.content.scale.y);
    this.flipMask = new FlipMask(this.content.width, this.content.height);
    this.addChild(this.content);
    this.addChild(this.flipMask);
    this.mask = this.flipMask;
    this.flipAngle = this._flipAngle;
    this.flipPosition = this._flipPosition;
    // Debug
    if (debug) {
      this.gp.circle(0, 0, 3);
      this.gp.fill(0xff0000);
      this.addChild(this.gp);
      this.grb.circle(0, 0, 3);
      this.grb.fill(0x00ff00);
      this.addChild(this.grb);
      this.grt.circle(0, 0, 3);
      this.grt.fill(0x00ffff);
      this.addChild(this.grt);
      this.gwh.circle(0, 0, 3);
      this.gwh.fill(0x0000ff);
      this.addChild(this.gwh);
      this.gb.circle(0, 0, 3);
      this.gb.fill(0xff00ff);
      this.addChild(this.gb);
    }
    // End Debug
  }

  get flipAngle() {
    return this._flipAngle;
  }

  set flipAngle(angle: number) {
    this.flipMask.flipAngle = this._flipAngle = angle;
    this.reset();
  }

  get flipPosition() {
    return this._flipPosition;
  }

  set flipPosition(position: number) {
    this._flipPosition = this.flipMask.flipPosition = position;
    this.reset();
  }

  reset() {
    // 前回のリセットから値が変わっていない場合はスキップ
    if (
      this._flipAngle === this._lastResetAngle &&
      this._flipPosition === this._lastResetPosition
    ) {
      return;
    }
    this._lastResetAngle = this._flipAngle;
    this._lastResetPosition = this._flipPosition;

    const w = this.content.width;
    const h = this.content.height;
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

    const base = new Point(Math.min(w, rightTop.x), h);

    const intersection = findPerpendicularPoint(rightBottom, rightTop, base);
    const a = Math.atan2(intersection.y - base.y, intersection.x - base.x);
    const l =
      Math.sqrt(
        (intersection.x - base.x) ** 2 + (intersection.y - base.y) ** 2,
      ) * 2;
    const p = new Point(base.x + Math.cos(a) * l, base.y + Math.sin(a) * l);
    const a2 = Math.atan2(p.y - rightBottom.y, p.x - rightBottom.x);

    // Debug
    if (debug) {
      // console.log(
      //   `a:${a / Math.PI} l:${l} p.x:${p.x} p.y:${p.y} a2:${a2 / Math.PI}`,
      // );
      this.gp.position.set(p.x, p.y); // red
      this.grb.position.set(rightBottom.x, rightBottom.y); // green
      this.grt.position.set(rightTop.x, rightTop.y); // cyan
      this.gwh.position.set(w, h); // blue
      this.gb.position.set(base.x, base.y); // purple
    }
    // End Debug

    this.content.rotation = a2;
    this.content.pivot.set(
      base.x / Math.abs(this.content.scale.x),
      base.y / Math.abs(this.content.scale.y),
    );
    this.content.position.set(p.x, p.y);
  }
}
