import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Lock } from "lucide-react";

interface PlaceholderDomainCardProps {
  title: string;
  summary?: string;
  isPaidUser: boolean;
  onAddActions?: () => void;
}

export const PlaceholderDomainCard = ({
  title,
  summary = "This domain is ready for customization with your specific actions and goals.",
  isPaidUser,
  onAddActions
}: PlaceholderDomainCardProps) => {
  return (
    <Card className="p-6 border-dashed border-2 border-muted-foreground/30 bg-muted/10 hover:bg-muted/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground/70 leading-relaxed italic">
            {summary}
          </p>
        </div>
        
        <div className="ml-4 flex flex-col items-center gap-2">
          <div className="w-[60px] h-[60px] rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Plus className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <span className="text-xs text-muted-foreground">
            0/0
          </span>
        </div>
      </div>
      
      <Button
        variant="outline"
        className="w-full justify-center border-dashed"
        disabled={!isPaidUser}
        onClick={onAddActions}
      >
        {!isPaidUser ? (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Upgrade to Add Actions
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add Actions to {title}
          </>
        )}
      </Button>
      
      {!isPaidUser && (
        <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-xs text-accent-foreground text-center">
            <strong>Upgrade to customize:</strong> Add your own actions and track progress
          </p>
        </div>
      )}
    </Card>
  );
};