import { Container, Assets, RoundedRectangle, Graphics } from "pixi.js";
import gsap from "gsap";
import { FlipMask } from "./flipMask";
import { FlipBackSide } from "./flipBackSide";
import FlipSprite from "./flipSprite";
import FlipSpriteButton from "./flipSpriteButton";
import { isPcChrome, isSpLayout } from "@/components/utils";

/**
 * コピーのコンテナ
 */
export class Copy extends Container {
  bg: Graphics = new Graphics();

  line1?: FlipSprite;
  line2?: FlipSprite;
  line3?: FlipSprite;
  line4?: FlipSprite;
  container: Container = new Container();
  backsideContainer: Container = new Container();

  thanksLine1?: FlipSprite;
  thanksLine2?: FlipSprite;
  thanksLine3?: FlipSprite;
  thanksLine4?: FlipSprite;
  thanksContainer: Container = new Container();
  thanksBacksideContainer: Container = new Container();

  button?: FlipSpriteButton;

  async load() {
    // スマホ用背景
    this.bg.roundRect(-40, -80, 790, 680, 20);
    this.bg.fill(0xffffff);
    this.addChild(this.bg);
    //
    const l1 = await Assets.load("/images/copy-connect.png.webp");
    const l2 = await Assets.load("/images/copy-everyone.png.webp");
    const l3 = await Assets.load("/images/copy-icon.png.webp");
    const l4 = await Assets.load(
      `/images/copy-small${isSpLayout() ? "-sp" : ""}.png.webp`,
    );
    const t1 = await Assets.load("/images/copy-thankyou1.png.webp");
    const t2 = await Assets.load("/images/copy-thankyou2.png.webp");
    const t3 = await Assets.load("/images/copy-thankyou3.png.webp");
    const t4 = await Assets.load("/images/copy-thankyou4.png.webp");
    const b = await Assets.load("/images/create-button-bg.png.webp");
    const bh = await Assets.load("/images/create-button-text.png.webp");
    const ba = await Assets.load("/images/create-button-arrow.png.webp");
    this.line1 = new FlipSprite(l1, 96);
    this.line2 = new FlipSprite(l2, 96);
    this.line3 = new FlipSprite(l3, 96);
    this.line4 = new FlipSprite(l4, 96);
    this.thanksLine1 = new FlipSprite(t1, 96);
    this.thanksLine2 = new FlipSprite(t2, 96);
    this.thanksLine3 = new FlipSprite(t3, 96);
    this.thanksLine4 = new FlipSprite(t4, 96);
    this.line2.position.y = 111;
    this.line3.position.y = 220;
    this.line4.position.y = 330;
    this.line4.position.x = 4;
    this.thanksLine2.position.y = 110;
    this.thanksLine3.position.y = 210;
    this.thanksLine4.position.y = 345;
    this.container.addChild(this.line1);
    this.container.addChild(this.line2);
    this.container.addChild(this.line3);
    this.container.addChild(this.line4);

    this.line1.backSide.position.y = this.line1.position.y;
    this.line2.backSide.position.y = this.line2.position.y;
    this.line3.backSide.position.y = this.line3.position.y;
    this.line4.backSide.position.y = this.line4.position.y;

    this.backsideContainer.addChild(this.line1.backSide);
    this.backsideContainer.addChild(this.line2.backSide);
    this.backsideContainer.addChild(this.line3.backSide);
    this.backsideContainer.addChild(this.line4.backSide);

    this.thanksContainer.addChild(this.thanksLine1);
    this.thanksContainer.addChild(this.thanksLine2);
    this.thanksContainer.addChild(this.thanksLine3);
    this.thanksContainer.addChild(this.thanksLine4);

    this.thanksLine1.backSide.position.y = this.thanksLine1.position.y;
    this.thanksLine2.backSide.position.y = this.thanksLine2.position.y;
    this.thanksLine3.backSide.position.y = this.thanksLine3.position.y;
    this.thanksLine4.backSide.position.y = this.thanksLine4.position.y;

    this.thanksBacksideContainer.addChild(this.thanksLine1.backSide);
    this.thanksBacksideContainer.addChild(this.thanksLine2.backSide);
    this.thanksBacksideContainer.addChild(this.thanksLine3.backSide);
    this.thanksBacksideContainer.addChild(this.thanksLine4.backSide);

    this.button = new FlipSpriteButton(b, bh, ba);
    this.button.position.set(0, 400);
    this.button.on("mousedown", () => {
      this.emit("create-button-click");
    });
    this.x = 40;
    window.addEventListener("resize", this.onResize);
    this.onResize();
  }

  async show() {
    console.log("[Copy] show");
    if (
      !this.line1 ||
      !this.line2 ||
      !this.line3 ||
      !this.line4 ||
      !this.button
    )
      return;
    this.addChild(this.container);
    this.addChild(this.backsideContainer);
    this.button.visible = !isSpLayout() && isPcChrome();
    if (this.button.visible) this.addChild(this.button);
    console.log("[Copy] show 1");
    const delay = 0.25;
    await Promise.all([
      this.line1.show(delay),
      this.line2.show(delay + 0.225),
      this.line3.show(delay + 0.45),
      this.line4.show(delay + 0.75, 0.75),
      this.button.show(delay + 0.9, 0.75),
    ]);
    console.log("[Copy] show 2");
  }

  async showThanks() {
    if (
      !this.thanksLine1 ||
      !this.thanksLine2 ||
      !this.thanksLine3 ||
      !this.thanksLine4
    )
      return;
    this.removeChild(this.container);
    this.removeChild(this.backsideContainer);
    this.addChild(this.thanksContainer);
    this.addChild(this.thanksBacksideContainer);
    const delay = 0.25;
    await Promise.all([
      this.thanksLine1.show(delay),
      this.thanksLine2.show(delay + 0.225),
      this.thanksLine3.show(delay + 0.45),
      this.thanksLine4.show(delay + 0.75, 0.75),
    ]);
  }

  onResize = () => {
    const s = Math.min(1, window.innerWidth / 900);
    this.scale.set(s, s);
    if (isSpLayout()) {
      this.bg.visible = true;
      if (this.button) this.button.visible = false;
      this.y = window.innerHeight * 0.5 - 300 * s;
      this.line4?.scale.set(1.5, 1.5);
      this.thanksLine4?.scale.set(1.5, 1.5);
    } else {
      this.bg.visible = false;
      if (this.button) {
        this.button.visible = isPcChrome();
        if (this.button.visible) this.addChild(this.button);
      }
      this.y = window.innerHeight * 0.5 - 240 * s;
      this.line4?.scale.set(1, 1);
      this.thanksLine4?.scale.set(1, 1);
    }
  };
}
