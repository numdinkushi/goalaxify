import { redirect } from "next/navigation";

import { AppRoute, ProfileTab } from "@/lib/enums";

export default function WalletPage() {
  redirect(`${AppRoute.Profiles}?tab=${ProfileTab.Wallet}`);
}
