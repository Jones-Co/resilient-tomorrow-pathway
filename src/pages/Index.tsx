import { useState } from "react";
import { UserProfile } from "@/components/UserProfile";
import { OverviewPanel } from "@/components/OverviewPanel";
import { DomainCard } from "@/components/DomainCard";
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
      summary: "Reclaim access to healthy, local, resilient food systems.",
      actions: {
        level0: ["Sign up for a local CSA", "Visit a farmers market this weekend"],
        level1: ["Start a balcony herb garden", "Preserve seasonal food (e.g., canning)"],
        level2: ["Host a neighborhood food share", "Learn seed saving"],
        level3: ["Build a year-round food production plan", "Convert lawn to garden"]
      },
      completed: ["Visit a farmers market this weekend"]
    },
    Power: {
      summary: "Reduce reliance on centralized, fragile energy grids.",
      actions: {
        level0: ["Buy a battery pack for your phone", "Switch to LED bulbs"],
        level1: ["Install a solar charger for small devices", "Calculate your energy usage"],
        level2: ["Install backup battery storage", "Switch energy provider to a green co-op"],
        level3: ["Design a partial solar system", "Run a critical load panel"]
      },
      completed: ["Switch to LED bulbs"]
    },
    Community: {
      summary: "Rebuild belonging and mutual aid as infrastructure.",
      actions: {
        level0: ["Introduce yourself to a neighbor", "Attend a local gathering"],
        level1: ["Start a text thread for your street", "Volunteer at a community org"],
        level2: ["Host a resilience dinner", "Form a skill-share group"],
        level3: ["Launch a mutual aid network", "Create a local barter system"]
      },
      completed: []
    },
    Water: {
      summary: "Secure clean, reliable water sources and conservation systems.",
      actions: {
        level0: ["Install a water filter", "Learn your watershed"],
        level1: ["Set up rainwater collection", "Audit your water usage"],
        level2: ["Build greywater system", "Join water conservation group"],
        level3: ["Design home water resilience plan", "Advocate for watershed protection"]
      },
      completed: []
    },
    Shelter: {
      summary: "Create resilient, energy-efficient, community-oriented living spaces.",
      actions: {
        level0: ["Improve home insulation", "Learn basic repairs"],
        level1: ["Install efficient heating/cooling", "Create emergency shelter kit"],
        level2: ["Design resilient home upgrades", "Form housing cooperative"],
        level3: ["Build alternative housing", "Develop eco-neighborhood"]
      },
      completed: []
    },
    Health: {
      summary: "Build personal and community health resilience and healing capacity.",
      actions: {
        level0: ["Learn basic first aid", "Build herbal medicine kit"],
        level1: ["Take wilderness medicine course", "Start community health group"],
        level2: ["Learn advanced healing skills", "Create neighborhood health network"],
        level3: ["Establish community health center", "Train community health workers"]
      },
      completed: []
    },
    Finance: {
      summary: "Create economic resilience through alternative systems and local exchange.",
      actions: {
        level0: ["Build emergency fund", "Learn about local currency"],
        level1: ["Join or start buying club", "Learn basic investing"],
        level2: ["Create mutual aid fund", "Start local business"],
        level3: ["Launch community bank", "Develop local economy"]
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

  const allDomains = Object.keys(userData.domainData);
  const exploredDomains = userData.selectedDomains.length;
  
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
          {Object.entries(userData.domainData).map(([domain, data]) => (
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
          ))}
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
