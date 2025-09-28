import {
  Container,
  Texture,
  Renderer,
  FederatedPointerEvent,
  Sprite,
  Rectangle,
} from "pixi.js";
import gsap from "gsap";
import { FlipMask } from "./flipMask";
import { FlipBackSide } from "./flipBackSide";
import { clear } from "console";

const cubicIn = gsap.parseEase("cubic.in");
const expoOut = gsap.parseEase("expo.out");

const ease = (i: number) => {
  return expoOut(cubicIn(i));
};

/**
 * めくれるエフェクトのコンテナ
 */
export default class FlipSprite extends Container {
  container: Container = new Container();
  sprite: Sprite;
  backSide: FlipBackSide;
  containerMask: FlipMask;
  maxHeight?: number;
  changeHitArea: boolean = true;
  minFlip: number = 0.5;
  minFlipAngle: number = Math.PI * -0.9999;
  maxFlipAngle: number = Math.PI * -0.55;

  protected _flipPosition: number = 0.75;
  protected _flipAngle: number = Math.PI * -0.75;
  protected _mouseOutTimer: number = 0;

  /**
   * コンストラクタ
   */
  constructor(texture: Texture, maxHeight?: number, resolution: number = 2) {
    super();
    this.maxHeight = maxHeight;
    this.sprite = new Sprite(texture);
    this.sprite.scale.set(1 / resolution, 1 / resolution);
    this.sprite.tint = 0x000000;
    const backsideSprite = new Sprite(texture);
    backsideSprite.scale.set(1 / resolution, 1 / resolution);
    backsideSprite.tint = 0xfd5100; // ここで裏面の色指定
    this.backSide = new FlipBackSide(backsideSprite);
    const w = texture.width / resolution;
    const h = texture.height / resolution;
    this.containerMask = new FlipMask(w, h);
    this.container.addChild(this.sprite);
    this.container.addChild(this.containerMask);
    this.container.mask = this.containerMask;
    this.addChild(this.container);
    this.addChild(this.backSide);
    this.visible = false;
    this.backSide.visible = false;
    this.flipAngle = this._flipAngle;
    this.flipPosition = this._flipPosition;
    this.interactive = true;
    // if (this.changeHitArea) {
    //   this.hitArea = new Rectangle(
    //     0,
    //     0,
    //     this.sprite.width,
    //     Math.min(this.sprite.height, this.maxHeight || 9999),
    //   );
    // }
    this.on("mouseover", this.onMouseOver);
    this.on("mouseout", this.onMouseOut);
  }

  get flipPosition() {
    return this._flipPosition;
  }

  set flipPosition(position: number) {
    this._flipPosition = position;
    this.backSide.flipPosition = position;
    this.containerMask.flipPosition = position;
  }

  get flipAngle() {
    return this._flipAngle;
  }

  set flipAngle(angle: number) {
    this._flipAngle = angle;
    this.backSide.flipAngle = angle;
    this.containerMask.flipAngle = angle;
  }

  /**
   * マウスイベント
   * @param e
   */
  onMouseOver = (e: FederatedPointerEvent) => {
    this._onMouseOver(e);
  };
  protected _onMouseOver(e: FederatedPointerEvent) {
    if (this._mouseOutTimer) clearTimeout(this._mouseOutTimer);
    const mouse = e.getLocalPosition(this);
    // if (mouse.x < this.sprite.width * 0.5) return;
    this.on("mousemove", this.onMouseMove);
    this.on("mousedown", this.onMouseDown);
    if (this.parent) this.parent.addChild(this);
    const h = Math.min(this.sprite.height, this.maxHeight || 9999);
    if (this.changeHitArea) {
      this.hitArea = new Rectangle(-40, -h * 0.5, this.sprite.width, h * 2);
    }
  }

  onMouseDown = (e: FederatedPointerEvent) => {
    this._onMouseOut(0);
  };

  onMouseMove = (e: FederatedPointerEvent) => {
    this._onMouseMove(e);
  };

  protected _onMouseMove(e: FederatedPointerEvent) {
    const mouse = e.getLocalPosition(this);
    const cx = this.sprite.width;
    const cy = this.sprite.height;

    const d = Math.sqrt((cx - mouse.x) ** 2 + (cy - mouse.y) ** 2);
    let a = Math.atan2(mouse.y - cy, mouse.x - cx) + Math.PI * 0;
    if (a > 0) a -= Math.PI * 2;
    const p = 1 - Math.max(0, Math.min(1, d / (cx * (1 - this.minFlip) * 2)));

    const flipPosition = this.minFlip + p * (1 - this.minFlip);
    const flipAngle = Math.max(
      Math.min(a, this.maxFlipAngle),
      this.minFlipAngle,
    );
    const positionDiff = Math.abs(this.flipPosition - flipPosition);
    gsap.to(this, {
      flipPosition,
      flipAngle,
      duration: 0.25 + positionDiff * 1,
      ease: "cubic.out",
      overwrite: true,
    });
    // ヒットエリア可変
    const radianToMouse = Math.atan2(mouse.y - cy, mouse.x - cx);
    const y =
      Math.sin(radianToMouse) * this.sprite.width * (1 - flipPosition) * 0.75;
    const h = Math.min(this.sprite.height, this.maxHeight || 9999);
    if (this.changeHitArea) {
      this.hitArea = new Rectangle(
        -40,
        // -h * 0.5 + y,
        -h * 0.5,
        this.sprite.width * 1.1,
        // h * 1.75 - y,
        h * 1.75,
      );
    }
  }

  onMouseOut = (e: FederatedPointerEvent) => {
    this._onMouseOut();
  };
  protected _onMouseOut(delay: number = 0.05) {
    this.off("mousemove", this.onMouseMove);
    this.off("mousedown", this.onMouseDown);
    if (this._mouseOutTimer) clearTimeout(this._mouseOutTimer);
    this._mouseOutTimer = window.setTimeout(() => {
      gsap.to(this, {
        flipPosition: 1,
        flipAngle: Math.PI * -0.75,
        duration: 1.0,
        ease: ease,
        overwrite: true,
      });
    }, delay * 1000);
    if (this.changeHitArea) {
      this.hitArea = new Rectangle(
        0,
        0,
        this.sprite.width,
        Math.min(this.sprite.height, this.maxHeight || 9999),
      );
    }
  }

  /**
   * 表示演出
   * @param delay
   */
  show(delay: number, duration: number = 1.25) {
    return new Promise((resolve) => {
      this.flipPosition = 0.001;
      this.flipAngle = Math.PI * -0.9999;
      this.visible = false;
      this.backSide.visible = false;
      gsap.to(this, {
        flipPosition: 1,
        flipAngle: Math.PI * -0.75,
        duration: duration,
        delay: delay,
        ease: ease,
        overwrite: true,
        onStart: () => {
          this.backSide.visible = true;
          this.visible = true;
        },
        onComplete: resolve,
      });
      // gsap.to(this, {
      //   flipAngle: Math.PI * -0.75,
      //   duration: 1.5,
      //   delay: delay,
      //   ease: "expo.inOut",
      // });
    });
  }
}
