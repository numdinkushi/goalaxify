import { getAvatarPublicId, getCloudinary } from "@/lib/cloudinary/config";

type UploadAvatarOptions = {
  file: File;
  walletPubkey: string;
};

type UploadAvatarResult = {
  url: string;
  publicId: string;
};

export async function uploadAvatarToCloudinary({
  file,
  walletPubkey,
}: UploadAvatarOptions): Promise<UploadAvatarResult> {
  const cloudinary = getCloudinary();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const publicId = getAvatarPublicId(walletPubkey);

  const result = await new Promise<UploadAvatarResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "goalaxify/avatars",
        public_id: walletPubkey.trim(),
        overwrite: true,
        invalidate: true,
        resource_type: "image",
        transformation: [{ width: 512, height: 512, crop: "fill", gravity: "auto" }],
      },
      (error, uploadResult) => {
        if (error || !uploadResult?.secure_url) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id ?? publicId,
        });
      },
    );

    uploadStream.end(buffer);
  });

  return result;
}
