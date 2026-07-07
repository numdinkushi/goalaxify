import { SettingsPageContent } from "@/components/settings/settings-page-content";
import { getServerPredictionPipelineChecks } from "@/lib/settlement/server-status";
import { isTxlineConfigured } from "@/lib/data/txline/enrich";

export default function SettingsPage() {
  const pipeline = getServerPredictionPipelineChecks();
  const txlineConfigured = isTxlineConfigured();

  return (
    <SettingsPageContent
      pipeline={pipeline}
      txlineConfigured={txlineConfigured}
    />
  );
}
