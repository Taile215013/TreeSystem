export async function optimizeImageToWebp(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
  // If not an image, just return the original file
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Also skip SVG images
  if (file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // We can also add maxHeight limit if needed
        const maxHeight = 1920;
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // fallback to original if canvas fails
        }

        // Fill background with white (helps if converting PNG with transparency to WebP without alpha, though WebP supports alpha)
        // WebP actually supports transparency, so this is optional, but good for safety.
        // ctx.fillStyle = "#ffffff";
        // ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // fallback
            }
            
            // Create a new File object with the webp blob
            // Replacing the old extension with .webp
            const originalName = file.name;
            const newName = originalName.replace(/\.[^/.]+$/, ".webp");
            
            const newFile = new File([blob], newName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            
            resolve(newFile);
          },
          "image/webp",
          quality
        );
      };
      
      img.onerror = (error) => {
        console.error("Error loading image for optimization", error);
        resolve(file); // return original on error
      };
    };
    
    reader.onerror = (error) => {
      console.error("Error reading file", error);
      resolve(file); // return original on error
    };
  });
}
