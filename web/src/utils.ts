import gsap from "gsap";

export function hexToRgb(hex: number) {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return { r, g, b };
}

export async function animateTint(
  target: { tint: number },
  fromColor: number,
  toColor: number = 0x000000,
  delay: number = 0,
  duration: number = 0.75,
  tintDuration: number = 0.05,
) {
  await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  target.tint = fromColor;
  const rgb = hexToRgb(target.tint);
  const toRgb = hexToRgb(toColor);
  gsap.to(rgb, {
    r: toRgb.r,
    g: toRgb.g,
    b: toRgb.b,
    onUpdate: () => {
      target.tint = (rgb.r << 16) + (rgb.g << 8) + rgb.b;
    },
    duration,
    delay: tintDuration,
    ease: "expo.out",
  });
}
