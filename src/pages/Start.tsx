import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";

const Start = () => {
  const [detectedPlan, setDetectedPlan] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Function to extract JSON plan from GPT output
  const extractLatestJsonPlan = () => {
    const blocks = document.querySelectorAll("pre code.language-json, code");
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i] as HTMLElement;
      try {
        const text = block.textContent || block.innerText || "";
        const plan = JSON.parse(text);
        if (plan.email && plan.domainData) {
          return plan;
        }
      } catch (e) {
        // Continue searching
      }
    }
    return null;
  };

  // Periodically check for GPT JSON output
  useEffect(() => {
    const interval = setInterval(() => {
      const plan = extractLatestJsonPlan();
      if (plan && !detectedPlan) {
        setDetectedPlan(plan);
        toast({
          title: "Plan Detected!",
          description: "Your personalized offramp plan is ready to submit.",
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [detectedPlan, toast]);

  // Submit plan to webhook and redirect
  const handleSubmitPlan = async () => {
    if (!detectedPlan) {
      toast({
        title: "No Plan Found",
        description: "Please complete your conversation with the GPT assistant first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://jonesco.app.n8n.cloud/webhook/save-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...detectedPlan,
          lastUpdated: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      
      if (data.dashboardId) {
        toast({
          title: "Plan Submitted Successfully!",
          description: "Redirecting to your personalized dashboard...",
        });
        setTimeout(() => {
          window.location.href = `/plan/${data.dashboardId}`;
        }, 1500);
      } else {
        toast({
          title: "Plan Saved",
          description: "Plan saved, but no dashboard ID returned.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting plan:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
          <p className="text-xl text-muted-foreground mb-2">
            Your Personalized Offramp Assistant
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chat with our AI assistant to create your customized plan for building resilience 
            across Food, Power, Money, Community, Communication, Knowledge, and Narrative domains.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* GPT Chat Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI Offramp Assistant
                </CardTitle>
                <CardDescription>
                  Chat with our specialized GPT to build your personalized resilience plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <iframe
                    src="https://chatgpt.com/g/g-685315e10ae081918e79b4b8682acd1f-resilient-tomorrow-offramp-assistant"
                    width="100%"
                    height="600"
                    frameBorder="0"
                    className="rounded-lg"
                    title="Resilient Tomorrow GPT Assistant"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    💡 <strong>How it works:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Answer questions about your goals, resources, and preferences</li>
                    <li>The AI will generate a personalized plan in JSON format</li>
                    <li>Once complete, click "Submit to Dashboard" to access your plan</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Plan Status</CardTitle>
                <CardDescription>
                  Your progress through the assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Detection Status */}
                <div className="flex items-center gap-3">
                  {detectedPlan ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-muted rounded-full" />
                  )}
                  <div>
                    <p className="font-medium">Plan Generated</p>
                    <p className="text-sm text-muted-foreground">
                      Complete the GPT conversation
                    </p>
                  </div>
                </div>

                {/* Plan Details */}
                {detectedPlan && (
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <h4 className="font-medium">Plan Preview</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-sm">{detectedPlan.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tier:</span>
                        <Badge variant="outline" className="text-xs">
                          {detectedPlan.subscriptionTier}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Domains:</span>
                        <span className="text-sm">
                          {detectedPlan.selectedDomains?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitPlan}
                  disabled={!detectedPlan || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {!detectedPlan && (
                  <p className="text-xs text-muted-foreground text-center">
                    Complete your GPT conversation to enable submission
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Domain Overview */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">7 Resilience Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {["Food", "Power", "Money", "Community", "Communication", "Knowledge", "Narrative"].map((domain) => (
                    <div key={domain} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      <span className="text-muted-foreground">{domain}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;