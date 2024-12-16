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
		let allEntries:FileSystemEntry[] = [];
		const getEntries = () =>
			new Promise<FileSystemEntry[]>((resolve) => {
				dirReader.readEntries((entries) => {
					resolve(entries);
				});
			});
		// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
		const readAllEntries = async () => {
			const entries = await getEntries() as FileSystemEntry[];
			if (entries.length > 0) {
				allEntries = allEntries.concat(entries);
				await readAllEntries();
			}
		};
		await readAllEntries();
		for (const entry of allEntries) {
			const f = await getFilesRecursive(entry);
			f.forEach(file => files.push(file));
		}
	}
	return files;
}
