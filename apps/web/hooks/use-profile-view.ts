"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { useWalletSession } from "@/hooks/use-wallet-session";
import { isConvexConfigured } from "@/lib/env/runtime";
import { appToast } from "@/lib/toast";
import { api } from "@goalaxify/convex/_generated/api";

export function useProfileView() {
  const { walletPubkey, isSessionActive, wallet, isRestoring } =
    useWalletSession();

  const profile = useQuery(
    api.profiles.getProfileView,
    isConvexConfigured() && walletPubkey ? { walletPubkey } : "skip",
  );

  const loading =
    isSessionActive && walletPubkey !== null && profile === undefined;

  const displayLabel = useMemo(() => {
    if (profile?.displayName) return profile.displayName;
    if (profile?.walletName) return profile.walletName;
    if (wallet?.adapter.name) return wallet.adapter.name;
    return "Goalaxify fan";
  }, [profile?.displayName, profile?.walletName, wallet?.adapter.name]);

  return {
    profile,
    loading,
    displayLabel,
    walletPubkey,
    isConnected: isSessionActive,
    isRestoring,
    wallet,
  };
}

type UseProfileEditorOptions = {
  onSaved?: () => void;
};

export function useProfileEditor({ onSaved }: UseProfileEditorOptions = {}) {
  const { walletPubkey } = useWalletSession();
  const { profile } = useProfileView();
  const updateProfile = useMutation(api.profiles.updateProfile);

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? "");
  }, [profile?.displayName]);

  const saveProfile = useCallback(async () => {
    if (!walletPubkey || !isConvexConfigured()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const trimmedName = displayName.trim();
      await updateProfile({
        walletPubkey,
        displayName: trimmedName || undefined,
      });
      appToast.profileSaved();
      onSaved?.();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Could not save your profile.";
      setError(message);
      appToast.profileSaveFailed(message);
    } finally {
      setSaving(false);
    }
  }, [displayName, onSaved, updateProfile, walletPubkey]);

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!walletPubkey || !isConvexConfigured()) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        const message = "Please choose an image file.";
        setError(message);
        appToast.avatarUploadFailed(message);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        const message = "Image must be 2MB or smaller.";
        setError(message);
        appToast.avatarUploadFailed(message);
        return;
      }

      setUploadingAvatar(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("walletPubkey", walletPubkey);

        const response = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Upload failed.");
        }

        const { url } = (await response.json()) as { url: string };

        await updateProfile({
          walletPubkey,
          avatarUrl: url,
        });
        appToast.avatarUpdated();
        onSaved?.();
      } catch (uploadError) {
        const message =
          uploadError instanceof Error
            ? uploadError.message
            : "Could not upload your image.";
        setError(message);
        appToast.avatarUploadFailed(message);
      } finally {
        setUploadingAvatar(false);
      }
    },
    [onSaved, updateProfile, walletPubkey],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        void uploadAvatar(file);
      }
      event.target.value = "";
    },
    [uploadAvatar],
  );

  return {
    displayName,
    setDisplayName,
    saveProfile,
    saving,
    uploadingAvatar,
    error,
    fileInputRef,
    openFilePicker,
    handleFileChange,
  };
}
