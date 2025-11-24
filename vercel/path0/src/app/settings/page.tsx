
'use client';

import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings-form";
import { ParticleBackground } from "@/components/ui/particle-background";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function SettingsPage() {
  useAuthGuard();
  
  return (
    <>
      <ParticleBackground />
      <div className="relative z-10 space-y-8">
          <PageHeader
            title="Identity Configuration"
            description="Define how the Intuition BETs protocol perceives your on-chain identity."
          />
        <SettingsForm />
      </div>
    </>
  );
}
