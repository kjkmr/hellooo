import { Container, Sprite, Graphics, Texture } from "pixi.js";
import CardBg from "./cardBg";
import gsap from "gsap";

/**
 * カード全体を覆う手書き画像のコンテナ
 * 白い矩形マスクを使用したワイプ表示演出付き
 */
export default class CardHandwriting extends Container {
  private sprite: Sprite;
  private maskGraphics: Graphics;

  /**
   * コンストラクタ
   * @param texture 手書き画像のテクスチャ
   */
  constructor(texture: Texture) {
    super();

    // 手書き画像のスプライトを作成
    this.sprite = new Sprite(texture);
    this.sprite.width = CardBg.WIDTH; // 350
    this.sprite.height = CardBg.HEIGHT; // 197
    this.sprite.x = 0;
    this.sprite.y = 0;

    // 白い矩形マスクを作成
    this.maskGraphics = new Graphics();
    this.maskGraphics.rect(0, 0, CardBg.WIDTH, CardBg.HEIGHT);
    this.maskGraphics.fill(0xffffff);

    // 初期位置は左上
    this.maskGraphics.x = 0;
    this.maskGraphics.y = 0;

    // コンテナに追加（スプライトが先、マスクが上）
    this.addChild(this.sprite);
    this.addChild(this.maskGraphics);
    this.mask = this.maskGraphics;

    // 初期状態では非表示
    // this.visible = false;
    this.maskGraphics.scale.x = 0;
  }

  /**
   * 表示演出（左から右へワイプ）
   * @param delay 遅延時間（秒）
   */
  show(delay: number = 0) {
    gsap.to(this.maskGraphics.scale, {
      x: 1,
      delay,
      duration: 1,
      ease: "sine.out",
    });
  }
}
