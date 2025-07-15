import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

interface TaskAction {
  task: string;
  time?: string;
  cost?: string;
  impact?: string;
  source?: string;
  categoryTags?: string[];
}

type ActionItem = string | TaskAction;

interface DomainActions {
  level0: ActionItem[];
  level1: ActionItem[];
  level2: ActionItem[];
  level3: ActionItem[];
}

interface DomainData {
  summary: string;
  actions: DomainActions;
  completed: string[];
}

interface DomainCardProps {
  title: string;
  data: DomainData;
  isExpanded: boolean;
  onToggle: () => void;
  onActionToggle: (action: string) => void;
  onReflectionChange: (reflection: string) => void;
  reflection?: string;
  isPaidUser: boolean;
}

export const DomainCard = ({
  title,
  data,
  isExpanded,
  onToggle,
  onActionToggle,
  onReflectionChange,
  reflection = "",
  isPaidUser
}: DomainCardProps) => {
  const [activeLevel, setActiveLevel] = useState<0 | 1 | 2 | 3>(0);
  
  // Helper function to get action identifier (task name for objects, full string for strings)
  const getActionId = (action: ActionItem): string => {
    return typeof action === 'string' ? action : action.task;
  };
  
  const getAllActions = () => {
    return [
      ...data.actions.level0,
      ...data.actions.level1,
      ...data.actions.level2,
      ...data.actions.level3
    ];
  };
  
  const completedCount = data.completed.length;
  const totalActions = getAllActions().length;
  const progressPercentage = totalActions > 0 ? (completedCount / totalActions) * 100 : 0;
  
  const getLevelActions = (level: 0 | 1 | 2 | 3) => {
    const levelKey = `level${level}` as keyof DomainActions;
    return data.actions[levelKey];
  };
  
  const getLevelProgress = (level: 0 | 1 | 2 | 3) => {
    const levelActions = getLevelActions(level);
    const levelCompleted = levelActions.filter(action => data.completed.includes(getActionId(action))).length;
    return levelActions.length > 0 ? (levelCompleted / levelActions.length) * 100 : 0;
  };

  // Helper function to get impact color
  const getImpactColor = (impact?: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'text-success';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
        </div>
        
        <div className="ml-4 flex flex-col items-center gap-2">
          <ProgressRing percentage={progressPercentage} />
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalActions}
          </span>
        </div>
      </div>
      
      <Button
        variant="outline"
        onClick={onToggle}
        className="w-full justify-between"
      >
        {isExpanded ? "Hide Actions" : "View Actions"}
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>
      
      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Level Navigation */}
          <div className="flex gap-2 flex-wrap">
            {[0, 1, 2, 3].map((level) => (
              <Button
                key={level}
                variant={activeLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveLevel(level as 0 | 1 | 2 | 3)}
                className="flex items-center gap-2"
              >
                Level {level}
                <div className="w-4 h-4">
                  <ProgressRing 
                    percentage={getLevelProgress(level as 0 | 1 | 2 | 3)} 
                    size={16} 
                    strokeWidth={2} 
                    showText={false}
                  />
                </div>
              </Button>
            ))}
          </div>
          
           {/* Actions List */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Level {activeLevel} Actions</h4>
            {getLevelActions(activeLevel).map((action, index) => {
              const actionId = getActionId(action);
              const isCompleted = data.completed.includes(actionId);
              const actionData = typeof action === 'object' ? action : null;
              
              return (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => onActionToggle(actionId)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-2">
                    <div className={`text-sm leading-relaxed font-medium ${
                      isCompleted 
                        ? 'line-through text-muted-foreground' 
                        : 'text-foreground'
                    }`}>
                      {actionData ? actionData.task : (typeof action === 'string' ? action : '')}
                    </div>
                    
                    {actionData && (
                      <div className="flex flex-wrap gap-3 text-xs">
                        {actionData.time && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span className="font-medium">Time:</span>
                            <span>{actionData.time}</span>
                          </div>
                        )}
                        {actionData.cost && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <span className="font-medium">Cost:</span>
                            <span>{actionData.cost}</span>
                          </div>
                        )}
                        {actionData.impact && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-muted-foreground">Impact:</span>
                            <span className={`font-medium ${getImpactColor(actionData.impact)}`}>
                              {actionData.impact}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {actionData?.categoryTags && actionData.categoryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {actionData.categoryTags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex} 
                            className="px-2 py-1 text-xs bg-accent/20 text-accent-foreground rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Reflection Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground">Reflection</h4>
              {!isPaidUser && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            
            {isPaidUser ? (
              <Textarea
                placeholder="Share your thoughts, insights, or challenges with this domain..."
                value={reflection}
                onChange={(e) => onReflectionChange(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
                <p className="text-sm text-muted-foreground text-center">
                  Upgrade to unlock reflection logging
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};