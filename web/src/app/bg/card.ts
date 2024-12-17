import { Container, Texture, FederatedPointerEvent } from "pixi.js";
import CardBg from "./cardBg";
import CardSprite from "./cardSprite";
import CardLabelText from "./cardLabelText";
import CardText from "./cardText";
import { Icon } from "../../../../common/_interface";
import gsap from "gsap";
import { FlipMask } from "./flipMask";
import { FlipBackSide } from "./flipBackSide";

const cubicIn = gsap.parseEase("cubic.in");
const expoOut = gsap.parseEase("expo.out");

const ease = (i: number) => {
  return expoOut(cubicIn(i));
};
/**
 * カード1枚分のコンテナ
 *
 * container: Container ->  bg: CardBg                  背景の角丸四角形
 *                          backSide: FlipBackSide      裏面の角丸四角形
 *                          containerMask: FlipMask     めくれるエフェクト用のマスク
 *                          icon: CardSprite            アイコン画像
 *                          qr: CardSprite              QRコード画像
 *                          accountLabel: CardLabelText アカウント名ラベル
 *                          account: CardText           アカウント名
 *                          companyLabel: CardLabelText 会社名ラベル
 *                          nameLabel: CardLabelText    名前ラベル
 */
export default class Card extends Container {
  container: Container = new Container();

  data: Icon | null;
  transparentBg: CardBg = new CardBg();
  bg: CardBg = new CardBg();
  backSide: FlipBackSide = new FlipBackSide(new CardBg("orange"));
  containerMask: FlipMask = new FlipMask(CardBg.WIDTH, CardBg.HEIGHT);
  icon: CardSprite;
  qr: CardSprite;
  accountLabel: CardLabelText = new CardLabelText("X(Twitter):", 110, 25);
  account: CardText = new CardText(110, 40);
  companyLabel: CardLabelText = new CardLabelText("Company:", 110, 25 + 53);
  nameLabel: CardLabelText = new CardLabelText("Name:", 110, 25 + 53 * 2);

  protected _flipPosition: number = 0.75;
  protected _flipAngle: number = Math.PI * -0.25;
  protected _mouseOutTimer: number = 0;

  /**
   * コンストラクタ
   */
  constructor(icon: Icon | null, iconTexture: Texture, qrTexture: Texture) {
    super();
    this.data = icon;
    this.icon = new CardSprite(25, 20, iconTexture);
    this.qr = new CardSprite(25, 105, qrTexture);
    this.transparentBg.alpha = 0;
    this.container.addChild(this.bg);
    this.container.addChild(this.icon);
    this.container.addChild(this.qr);
    this.container.addChild(this.accountLabel);
    this.container.addChild(this.account);
    this.container.addChild(this.companyLabel);
    this.container.addChild(this.nameLabel);
    if (icon) {
      this.account.setText(`@${icon.account}`);
    }
    this.container.addChild(this.containerMask);
    this.container.mask = this.containerMask;
    this.addChild(this.transparentBg);
    this.addChild(this.container);
    this.addChild(this.backSide);
    this.visible = false;
    this.interactive = true;
    this.cursor = "pointer";
    this.flipAngle = this._flipAngle;
    this.flipPosition = this._flipPosition;
    this.on("mouseover", this.onMouseOver);
    this.on("mouseout", this.onMouseOut);
    this.on("click", this.onClick);
  }

  /**
   * マウスイベント
   * @param e
   */

  onClick = (e: FederatedPointerEvent) => {
    this.data?.url &&
      window.open(`https://x.com/${this.data.account}`, "_blank");
  };

  onMouseOver = (e: FederatedPointerEvent) => {
    if (this._mouseOutTimer) window.clearTimeout(this._mouseOutTimer);
    this.on("mousemove", this.onMouseMove);
    this.parent.addChild(this);
  };

  onMouseMove = (e: FederatedPointerEvent) => {
    const mouse = e.getLocalPosition(this);
    const cx = CardBg.WIDTH;
    // const cy = CardBg.HEIGHT * 0.5;
    const cy = CardBg.HEIGHT;
    const d = Math.sqrt((cx - mouse.x) ** 2 + (cy - mouse.y) ** 2);
    let a = Math.atan2(mouse.y - cy, mouse.x - cx) + Math.PI * 0;
    if (a > 0) a -= Math.PI * 2;
    const minFlip = 0.75;
    const p = 1 - Math.max(0, Math.min(1, d / (cx * (1 - minFlip) * 2)));
    gsap.to(this, {
      flipPosition: minFlip + p * (1 - minFlip),
      flipAngle: Math.max(Math.min(a, Math.PI * -0.55), Math.PI * -0.95),
      duration: 0.75,
      ease: "cubic.out",
    });
  };

  onMouseOut = (e: FederatedPointerEvent) => {
    this.off("mousemove", this.onMouseMove);
    if (this._mouseOutTimer) window.clearTimeout(this._mouseOutTimer);
    this._mouseOutTimer = window.setTimeout(() => {
      gsap.to(this, {
        flipPosition: 1,
        flipAngle: Math.PI * -0.75,
        duration: 1.0,
        ease: ease,
        overwrite: true,
      });
    }, 50);
  };

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
   * 表示演出
   * @param delay
   */
  show(delay: number) {
    setTimeout(() => {
      this.visible = true;
      this.accountLabel.show();
      this.account.show();
      this.companyLabel.show();
      this.nameLabel.show();
      this.flipPosition = 0.85;
      this.flipAngle = Math.PI * -0.75;
      gsap.fromTo(
        this.position,
        {
          x: -40,
        },
        {
          x: 0,
          duration: 0.25,
          ease: "expo.out",
        },
      );
      gsap.to(this, {
        flipPosition: 1,
        flipAngle: Math.PI * -0.75,
        duration: 1,
        ease: ease,
        overwrite: true,
      });
    }, delay * 1000);
  }
}
