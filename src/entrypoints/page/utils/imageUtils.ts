export function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (blob && blob.size > 0) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) =>
        reject("Error converting Blob to Base64: " + error);
      reader.readAsDataURL(blob);
    } else {
      reject("Blob is empty");
    }
  });
}

export function compressImageToTargetSize(
  file: File,
  targetSize: number,
  callback: (file: File) => void,
): void {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      let quality = 0.92;

      function tryCompress(): void {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/jpeg", quality);
        const byteString = atob(dataURL.split(",")[1]);
        const byteLength = byteString.length;

        if (byteLength <= targetSize * 1024) {
          const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const newFile = new File([blob], "compressed.jpg", {
            type: mimeString,
            lastModified: Date.now(),
          });
          callback(newFile);
        } else {
          quality -= 0.02;
          if (quality < 0.01) {
            console.error("Unable to compress image to target size");
            return;
          }
          tryCompress();
        }
      }

      tryCompress();
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(file);
}
