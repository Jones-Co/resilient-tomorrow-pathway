import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Lock } from "lucide-react";

interface UserProfileProps {
  email: string;
  subscriptionTier: "Free" | "Paid";
  status: "Onboarding" | "Active";
}

export const UserProfile = ({ email, subscriptionTier, status }: UserProfileProps) => {
  return (
    <Card className="p-6 bg-gradient-warm border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">{email}</h3>
            <p className="text-sm text-muted-foreground">Status: {status}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {subscriptionTier === "Free" && (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
          <Badge 
            variant={subscriptionTier === "Paid" ? "default" : "secondary"}
            className={subscriptionTier === "Paid" ? "bg-success" : ""}
          >
            {subscriptionTier} Tier
          </Badge>
        </div>
      </div>
      
      {subscriptionTier === "Free" && (
        <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-accent-foreground">
            <strong>Upgrade for full access:</strong> Progress tracking, reflections, and future tools
          </p>
        </div>
      )}
    </Card>
  );
};