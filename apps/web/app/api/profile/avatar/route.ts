import { NextResponse } from "next/server";

import { isCloudinaryConfigured } from "@/lib/cloudinary/config";
import { uploadAvatarToCloudinary } from "@/lib/cloudinary/upload-avatar";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured." },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const walletPubkey = formData.get("walletPubkey");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (typeof walletPubkey !== "string" || !walletPubkey.trim()) {
      return NextResponse.json(
        { error: "Wallet address is required." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are supported." },
        { status: 400 },
      );
    }

    if (file.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { error: "Image must be 2MB or smaller." },
        { status: 400 },
      );
    }

    const { url, publicId } = await uploadAvatarToCloudinary({
      file,
      walletPubkey: walletPubkey.trim(),
    });

    return NextResponse.json({ url, publicId });
  } catch (error) {
    console.error("[profile/avatar]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not upload avatar.",
      },
      { status: 500 },
    );
  }
}
