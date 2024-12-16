import { Container, FederatedPointerEvent, Sprite, Texture } from "pixi.js";
import gsap from "gsap";
import FlipSprite from "./flipSprite";

class ButtonLayout extends Container {
  bgSprite: Sprite;
  textSprite: Sprite;
  arrowSprite: Sprite;
  constructor(
    bgTexture: Texture,
    textTexture: Texture,
    arrowTexture: Texture,
    bgColor: number,
    textColor: number,
    resolution: number,
  ) {
    super();
    this.bgSprite = new Sprite(bgTexture);
    this.bgSprite.tint = bgColor;
    this.bgSprite.scale.set(1 / resolution, 1 / resolution);
    this.textSprite = new Sprite(textTexture);
    this.textSprite.tint = textColor;
    this.textSprite.scale.set(1 / resolution, 1 / resolution);
    this.arrowSprite = new Sprite(arrowTexture);
    this.arrowSprite.tint = textColor;
    this.arrowSprite.scale.set(1 / resolution, 1 / resolution);
    this.addChild(this.bgSprite);
    this.addChild(this.textSprite);
    this.addChild(this.arrowSprite);
  }

  mouseOver() {
    gsap.to(this.arrowSprite, { x: 10, duration: 0.5, ease: "cubic.out" });
  }

  mouseOut() {
    gsap.to(this.arrowSprite, {
      x: 0,
      duration: 0.5,
      ease: "cubic.out",
    });
  }
}

/**
 * めくれるエフェクトのコンテナ
 */
export default class FlipSpriteButton extends FlipSprite {
  normal: ButtonLayout;
  hover: ButtonLayout;
  protected _texture: Texture;
  protected _mouseOutFadeTimer: number = 0;

  /**
   * コンストラクタ
   */
  constructor(
    texture: Texture,
    textTexture: Texture,
    arrowTexture: Texture,
    resolution: number = 2,
    maxHeight?: number,
  ) {
    super(texture, resolution, maxHeight);
    this.minFlip = 0.85;
    this.minFlipAngle = Math.PI * -0.95;
    this.changeHitArea = false;
    this.sprite.alpha = 0;
    this._texture = texture;
    this.normal = new ButtonLayout(
      texture,
      textTexture,
      arrowTexture,
      0xfd5100,
      0xffffff,
      resolution,
    );
    this.hover = new ButtonLayout(
      texture,
      textTexture,
      arrowTexture,
      0xffffff,
      0xfd5100,
      resolution,
    );
    this.container.addChild(this.normal);
    this.container.addChild(this.hover);
    this.interactive = true;
    this.on("click", this.onClick);
    this.cursor = "pointer";
  }

  onClick = (e: FederatedPointerEvent) => {
    console.log(e);
  };

  override async show(delay: number, duration: number = 1.25) {
    super.show(delay, duration);
    gsap.to(this.hover, {
      alpha: 0,
      duration: 0.5,
      delay: duration + delay,
      ease: "cubic.inOut",
    });
  }

  protected override _onMouseOver(e: FederatedPointerEvent) {
    super._onMouseOver(e);
    if (this._mouseOutFadeTimer) window.clearTimeout(this._mouseOutFadeTimer);
    gsap.to(this.normal, {
      alpha: 0,
      delay: 0.1,
      duration: 0.4,
      ease: "expo.in",
      overwrite: true,
      onComplete: () => {
        this.normal.visible = false;
      },
    });
    gsap.to(this.hover, {
      alpha: 1,
      duration: 0.5,
      ease: "expo.out",
      overwrite: true,
    });
    this.normal.mouseOver();
    this.hover.mouseOver();
  }
  protected override _onMouseOut() {
    super._onMouseOut();
    if (this._mouseOutFadeTimer) window.clearTimeout(this._mouseOutFadeTimer);
    this.normal.mouseOut();
    this.hover.mouseOut();
    this._mouseOutFadeTimer = window.setTimeout(() => {
      this.normal.visible = true;
      this.normal.alpha = 1;
      gsap.to(this.hover, {
        alpha: 0,
        duration: 0.5,
        overwrite: true,
        ease: "expo.inOut",
      });
    }, 0.5 * 1000);
  }
}
