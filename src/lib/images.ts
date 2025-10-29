// Converts a selected image file to a Base64 data URL
export async function fileToDataUrl(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  // Downscales large images before saving to LocalStorage or PDF
  export async function downscaleDataUrl(
    dataUrl: string,
    maxW = 1600
  ): Promise<string> {
    const img = document.createElement("img");
    img.src = dataUrl;
    await img.decode();
  
    // calculate new width/height
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
  
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
  
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
  
    // Convert to JPEG, quality 0.85
    return canvas.toDataURL("image/jpeg", 0.85);
  }
  