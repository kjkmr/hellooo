declare module "./spritesheet-data.json" {
  interface Frame {
    frame: { x: number; y: number; w: number; h: number };
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
  }

  interface SpritesheetMeta {
    app: string;
    version: string;
    image: string;
    imageWebp?: string;
    format: string;
    size: { w: number; h: number };
    scale: number;
  }

  interface SpritesheetData {
    frames: Record<string, Frame>;
    meta: SpritesheetMeta;
  }

  const data: {
    icons: SpritesheetData;
    qr: SpritesheetData;
  };

  export default data;
}