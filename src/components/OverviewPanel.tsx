import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "./ProgressRing";
import { Calendar, CheckCircle, Target } from "lucide-react";

interface OverviewPanelProps {
  totalDomains: number;
  exploredDomains: number;
  totalActions: number;
  completedActions: number;
  isPaidUser: boolean;
  onReminderClick: () => void;
}

export const OverviewPanel = ({
  totalDomains,
  exploredDomains,
  totalActions,
  completedActions,
  isPaidUser,
  onReminderClick
}: OverviewPanelProps) => {
  const exploredPercentage = totalDomains > 0 ? (exploredDomains / totalDomains) * 100 : 0;
  const completedPercentage = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

  return (
    <Card className="p-6 bg-gradient-primary text-primary-foreground">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Resilience Journey</h2>
          <p className="text-primary-foreground/80 text-sm">
            Building sovereignty and belonging, one action at a time
          </p>
        </div>
        
        <div className="flex gap-8">
          {/* Domains Progress */}
          <div className="text-center">
            <ProgressRing 
              percentage={exploredPercentage} 
              size={80} 
              strokeWidth={8}
            />
            <p className="text-xs mt-2 text-primary-foreground/80">
              Domains Explored
            </p>
            <p className="text-sm font-medium">
              {exploredDomains} of {totalDomains}
            </p>
          </div>
          
          {/* Actions Progress */}
          <div className="text-center">
            <ProgressRing 
              percentage={completedPercentage} 
              size={80} 
              strokeWidth={8}
            />
            <p className="text-xs mt-2 text-primary-foreground/80">
              Actions Completed
            </p>
            <p className="text-sm font-medium">
              {completedActions} total
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-primary-foreground/20">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-primary-foreground/80" />
          <div>
            <p className="text-sm font-medium">Active Domains</p>
            <p className="text-xs text-primary-foreground/80">{exploredDomains} areas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary-foreground/80" />
          <div>
            <p className="text-sm font-medium">Completion Rate</p>
            <p className="text-xs text-primary-foreground/80">{Math.round(completedPercentage)}%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-foreground/80" />
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={onReminderClick}
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              disabled={!isPaidUser}
            >
              Set Reminder
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};