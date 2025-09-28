/**
 * getImageAsBase64
 * @param url
 */
export function getImageAsBase64(url: string): Promise<string> {
	return new Promise<string>((resolve) => {
		fetch(url)
			.then((response) => response.blob())
			.then((blob) => {
				const reader = new FileReader();
				reader.onload = () => {
					resolve(reader.result as string);
				};
				reader.readAsDataURL(blob);
			});
	});
}