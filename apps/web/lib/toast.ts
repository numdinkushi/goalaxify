import { toast } from "sonner";

export const appToast = {
  profileSaved() {
    toast.success("Profile saved", {
      description: "Your username and details are updated.",
    });
  },

  avatarUpdated() {
    toast.success("Avatar updated", {
      description: "Your profile photo is live.",
    });
  },

  addressCopied() {
    toast.success("Address copied", {
      description: "Wallet address copied to clipboard.",
    });
  },

  walletDisconnected() {
    toast.success("Wallet disconnected", {
      description: "You can reconnect anytime from the header.",
    });
  },

  profileSaveFailed(message: string) {
    toast.error("Could not save profile", {
      description: message,
    });
  },

  avatarUploadFailed(message: string) {
    toast.error("Could not upload avatar", {
      description: message,
    });
  },

  copyFailed() {
    toast.error("Copy failed", {
      description: "We could not copy that to your clipboard.",
    });
  },

  genericError(title: string, description?: string) {
    toast.error(title, { description });
  },

  genericSuccess(title: string, description?: string) {
    toast.success(title, { description });
  },
};

export { toast };
