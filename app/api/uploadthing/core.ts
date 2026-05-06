import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Logic giả lập kiểm tra người dùng (bạn có thể dùng Auth của bạn ở đây)
const auth = (req: Request) => ({ id: "user1" });

export const ourFileRouter = {
  // Route để upload ảnh sản phẩm (cây cảnh)
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),

  // Route để upload ảnh đại diện người dùng
  avatar: f({ image: { maxFileSize: "2MB" } })
    .onUploadComplete(({ file }) => {
      console.log("Avatar URL:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;