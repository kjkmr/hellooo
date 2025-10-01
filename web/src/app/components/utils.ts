export function isSpLayout() {
  return window !== undefined ? window.innerWidth < 768 : false;
}

export function isPcChrome() {
  if (navigator.userAgentData) {
    const brands = navigator.userAgentData.brands || [];
    const isChrome = brands.some((brand) => brand.brand.includes("Chrome"));
    const isDesktop =
      navigator.userAgentData.platform === "Windows" ||
      navigator.userAgentData.platform === "macOS" ||
      navigator.userAgentData.platform === "Linux";
    return isChrome && isDesktop;
  } else {
    const ua = window.navigator.userAgent.toLowerCase();
    const isChrome = ua.indexOf("chrome") !== -1;
    const isMacOS = ua.indexOf("mac") !== -1;
    const isWindows = ua.indexOf("windows") !== -1;
    const isLinux = ua.indexOf("linux") !== -1;
    return isChrome && (isMacOS || isWindows || isLinux);
  }
}

/**
 * 再起的にファイルを取得する
 * @param entry
 * @returns
 */
export async function getFilesRecursive(entry: FileSystemEntry) {
  const files = [];
  if (entry.isFile) {
    const file = await new Promise((resolve) => {
      (entry as FileSystemFileEntry).file((file) => {
        resolve(file);
      });
    });
    files.push(file);
  } else if (entry.isDirectory) {
    const dirReader = (entry as FileSystemDirectoryEntry).createReader();
    let allEntries: FileSystemEntry[] = [];
    const getEntries = () =>
      new Promise<FileSystemEntry[]>((resolve) => {
        dirReader.readEntries((entries) => {
          resolve(entries);
        });
      });
    // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
    const readAllEntries = async () => {
      const entries = (await getEntries()) as FileSystemEntry[];
      if (entries.length > 0) {
        allEntries = allEntries.concat(entries);
        await readAllEntries();
      }
    };
    await readAllEntries();
    for (const entry of allEntries) {
      const f = await getFilesRecursive(entry);
      f.forEach((file) => files.push(file));
    }
  }
  return files;
}

/**
 * ドラッグされたテキストファイル群からアカウントリストを取得する
 * @param items
 * @returns
 */
export async function getAccountLists(items: DataTransferItemList) {
  const accountLists: File[] = [];
  const calcFullPathPerItems = Array.from(items).map((item) => {
    return new Promise<void>(async (resolve) => {
      const entry = item.webkitGetAsEntry();
      // nullの時は何もしない
      if (!entry) {
        resolve();
        return;
      }
      const f = (await getFilesRecursive(entry)) as File[];
      f.forEach((file) => accountLists.push(file));
      resolve();
    });
  });
  await Promise.all(calcFullPathPerItems);

  // get account names
  async function read(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target!.result as string;
        const lines = result.split("\n");
        resolve(lines);
      };
      reader.onerror = (event) => {
        reject(event);
      };
      reader.readAsText(file);
    });
  }
  const accounts: string[] = [];
  for (let i = 0; i < accountLists.length; i++) {
    if (!accountLists[i]) continue;
    const t = await read(accountLists[i]!);
    t.map((account) => {
      let a = account;
      if (a.match(/^@/)) a = a.slice(1);
      if (a.match(/https?:\/\//))
        a = a.replace(/https?:\/\/[^\/]+\/([^\/]+)/, "$1");
      if (a.match(/^ *$/)) return;
      accounts.push(`@${a}`);
    });
  }
  return accounts;
}

export function downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, "  ")], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
