import { useState } from "react";
import { UserProfile } from "@/components/UserProfile";
import { OverviewPanel } from "@/components/OverviewPanel";
import { DomainCard } from "@/components/DomainCard";
import { PlaceholderDomainCard } from "@/components/PlaceholderDomainCard";
import { ReminderDialog } from "@/components/ReminderDialog";
import { JsonInput } from "@/components/JsonInput";
import { useToast } from "@/hooks/use-toast";

// Mock data from the design brief
const mockUserData = {
  email: "user@example.com",
  subscriptionTier: "Free" as "Free" | "Paid",
  status: "Active" as "Onboarding" | "Active",
  selectedDomains: ["Food", "Power", "Community"],
  domainData: {
    Food: {
      summary: "Reclaim autonomy one bite at a time.",
      actions: {
        level0: ["Grow herbs", "Join a local CSA"],
        level1: ["Start a compost bin", "Preserve seasonal food"],
        level2: ["Host a food share", "Build a raised bed garden"],
        level3: ["Convert lawn to food production", "Create a neighborhood seed library"]
      },
      completed: ["Join a local CSA"]
    },
    Power: {
      summary: "Reduce reliance on centralized energy.",
      actions: {
        level0: ["Switch to LED bulbs", "Buy a battery pack"],
        level1: ["Calculate energy usage", "Use off-grid cooking"],
        level2: ["Install backup battery storage", "Build a DIY solar charger"],
        level3: ["Install a critical load panel", "Design a solar system with a neighbor"]
      },
      completed: ["Switch to LED bulbs"]
    },
    Community: {
      summary: "Make mutual aid your infrastructure.",
      actions: {
        level0: ["Introduce yourself to a neighbor", "Attend a local gathering"],
        level1: ["Start a text thread", "Volunteer at a local org"],
        level2: ["Host a potluck", "Organize a tool share"],
        level3: ["Start a mutual aid fund", "Create a neighborhood resilience group"]
      },
      completed: []
    },
    Money: {
      summary: "Build economic resilience beyond traditional financial systems.",
      actions: {
        level0: ["Track your spending", "Learn about alternative currencies"],
        level1: ["Build an emergency fund", "Join a buying club"],
        level2: ["Start a local investment circle", "Create a mutual aid fund"],
        level3: ["Launch a community bank", "Develop local economic networks"]
      },
      completed: []
    },
    Communication: {
      summary: "Create resilient information networks and authentic connection.",
      actions: {
        level0: ["Start a neighborhood group chat", "Learn basic digital security"],
        level1: ["Set up mesh networking", "Create a community newsletter"],
        level2: ["Build local media networks", "Organize citizen journalism"],
        level3: ["Establish community radio", "Create independent information systems"]
      },
      completed: []
    },
    Knowledge: {
      summary: "Preserve and share essential skills for community resilience.",
      actions: {
        level0: ["Document a skill you have", "Learn from a neighbor"],
        level1: ["Teach a workshop", "Start a skill-sharing group"],
        level2: ["Create a local knowledge library", "Organize skill exchanges"],
        level3: ["Build a community learning center", "Develop apprenticeship programs"]
      },
      completed: []
    },
    Narrative: {
      summary: "Shape the stories that guide us toward regenerative futures.",
      actions: {
        level0: ["Share your personal story", "Attend storytelling events"],
        level1: ["Document community stories", "Host story circles"],
        level2: ["Create community media", "Organize narrative workshops"],
        level3: ["Launch storytelling festivals", "Build narrative infrastructure"]
      },
      completed: []
    }
  }
};

const Index = () => {
  const [userData, setUserData] = useState(mockUserData);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const { toast } = useToast();

  // Always show all 7 domains regardless of what's in userData
  const allDomains = ["Food", "Power", "Money", "Community", "Communication", "Knowledge", "Narrative"];
  const exploredDomains = userData.selectedDomains.length; // Domains with actions assigned
  const domainsWithActions = userData.selectedDomains;
  
  const getAllActions = () => {
    return Object.values(userData.domainData).flatMap(domain => [
      ...domain.actions.level0,
      ...domain.actions.level1,
      ...domain.actions.level2,
      ...domain.actions.level3
    ]);
  };
  
  const getAllCompletedActions = () => {
    return Object.values(userData.domainData).flatMap(domain => domain.completed);
  };

  const totalActions = getAllActions().length;
  const completedActions = getAllCompletedActions().length;

  const handleDomainToggle = (domain: string) => {
    setExpandedDomains(prev => {
      const newSet = new Set(prev);
      if (newSet.has(domain)) {
        newSet.delete(domain);
      } else {
        newSet.add(domain);
      }
      return newSet;
    });
  };

  const handleActionToggle = (domain: string, action: string) => {
    setUserData(prev => {
      const newData = { ...prev };
      const domainData = newData.domainData[domain as keyof typeof newData.domainData];
      
      if (domainData.completed.includes(action)) {
        domainData.completed = domainData.completed.filter(a => a !== action);
        toast({
          title: "Action unmarked",
          description: "Removed from completed actions",
        });
      } else {
        domainData.completed = [...domainData.completed, action];
        toast({
          title: "Great progress!",
          description: "Action marked as completed",
        });
      }
      
      return newData;
    });
  };

  const handleReflectionChange = (domain: string, reflection: string) => {
    setReflections(prev => ({
      ...prev,
      [domain]: reflection
    }));
  };

  const handleReminderClick = () => {
    if (userData.subscriptionTier === "Free") {
      toast({
        title: "Upgrade Required",
        description: "Reminders are available for paid subscribers",
        variant: "destructive",
      });
      return;
    }
    setReminderDialogOpen(true);
  };

  const handleJsonUpdate = (newData: any) => {
    if (newData === null) {
      // Reset to mock data
      setUserData(mockUserData);
      setExpandedDomains(new Set());
      setReflections({});
    } else {
      setUserData(newData);
      setExpandedDomains(new Set());
      setReflections({});
    }
  };

  const handleAddActions = (domain: string) => {
    if (userData.subscriptionTier === "Free") {
      toast({
        title: "Upgrade Required", 
        description: "Adding custom actions requires a paid subscription",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Coming Soon",
      description: `Action customization for ${domain} will be available soon`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/badeea5d-467f-4971-8815-15ecfe8e22c1.png" 
              alt="Resilient Tomorrow Logo" 
              className="w-32 h-32 object-contain"
            />
            <h1 className="text-4xl font-bold text-foreground">
              Resilient Tomorrow
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your personalized offramp dashboard
          </p>
        </div>

        {/* JSON Input for Testing */}
        <JsonInput 
          onJsonUpdate={handleJsonUpdate}
          currentData={userData}
        />

        {/* User Profile */}
        <div className="mb-8">
          <UserProfile
            email={userData.email}
            subscriptionTier={userData.subscriptionTier}
            status={userData.status}
          />
        </div>

        {/* Overview Panel */}
        <div className="mb-8">
          <OverviewPanel
            totalDomains={allDomains.length}
            exploredDomains={exploredDomains}
            totalActions={totalActions}
            completedActions={completedActions}
            isPaidUser={userData.subscriptionTier === "Paid"}
            onReminderClick={handleReminderClick}
          />
        </div>

        {/* Domain Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Active Domains - those with actions */}
          {domainsWithActions.map((domain) => {
            const data = userData.domainData[domain as keyof typeof userData.domainData];
            return (
              <DomainCard
                key={domain}
                title={domain}
                data={data}
                isExpanded={expandedDomains.has(domain)}
                onToggle={() => handleDomainToggle(domain)}
                onActionToggle={(action) => handleActionToggle(domain, action)}
                onReflectionChange={(reflection) => handleReflectionChange(domain, reflection)}
                reflection={reflections[domain]}
                isPaidUser={userData.subscriptionTier === "Paid"}
              />
            );
          })}
          
          {/* Placeholder Domains - those without actions yet */}
          {allDomains
            .filter(domain => !domainsWithActions.includes(domain))
            .map((domain) => {
              const data = userData.domainData[domain as keyof typeof userData.domainData];
              return (
                <PlaceholderDomainCard
                  key={domain}
                  title={domain}
                  summary={data?.summary}
                  isPaidUser={userData.subscriptionTier === "Paid"}
                  onAddActions={() => handleAddActions(domain)}
                />
              );
            })}
        </div>

        {/* Reminder Dialog */}
        <ReminderDialog
          open={reminderDialogOpen}
          onOpenChange={setReminderDialogOpen}
          userEmail={userData.email}
        />
      </div>
    </div>
  );
};

export default Index;
