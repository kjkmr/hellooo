import { Icon } from "../../../../common/_interface";
import iconsData from "./icons-data.json";

// 画像データはpublicフォルダから読み込むように変更
export const icons: Icon[] = iconsData.map(icon => ({
  account: icon.account,
  url: icon.url,
  dataPath: icon.dataPath,
  qrPath: icon.qrPath
}));
