import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Index from "./Index";

const Plan = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const fetchPlanData = async (isRetryAttempt = false) => {
    if (!dashboardId) {
      toast({
        title: "Invalid Dashboard ID",
        description: "No dashboard ID provided in the URL.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_plans")
        .select("*")
        .eq("id", dashboardId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching plan:", error);
        if (!isRetryAttempt || retryCount >= 20) {
          toast({
            title: "Error Loading Plan",
            description: "Failed to load your personalized plan.",
            variant: "destructive",
          });
          setLoading(false);
          clearTimers();
        }
        return false;
      }

      if (data && data.plan_data) {
        setPlanData(data.plan_data);
        setLoading(false);
        clearTimers();
        return true;
      }

      // Data exists but plan_data is null - plan is still being generated
      if (data && !data.plan_data) {
        if (!isRetryAttempt) {
          startRetryPolling();
        }
        return false;
      }

      // No data found
      if (!isRetryAttempt) {
        startRetryPolling();
      }
      return false;
    } catch (error) {
      console.error("Error fetching plan:", error);
      if (!isRetryAttempt || retryCount >= 20) {
        toast({
          title: "Error Loading Plan",
          description: "Failed to load your personalized plan.",
          variant: "destructive",
        });
        setLoading(false);
        clearTimers();
      }
      return false;
    }
  };

  const startRetryPolling = () => {
    setIsRetrying(true);
    
    // Start timer to track elapsed time
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Start polling every 3 seconds
    intervalRef.current = setInterval(async () => {
      setRetryCount(prev => {
        const newCount = prev + 1;
        
        if (newCount >= 20) {
          clearTimers();
          setLoading(false);
          setIsRetrying(false);
          toast({
            title: "Plan Generation Timeout",
            description: "Your plan is taking longer than expected. Please try again or contact support.",
            variant: "destructive",
          });
          return newCount;
        }
        
        fetchPlanData(true);
        return newCount;
      });
    }, 3000);
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    setElapsedTime(0);
    setLoading(true);
    setIsRetrying(false);
    clearTimers();
    fetchPlanData();
  };

  useEffect(() => {
    fetchPlanData();
    
    // Cleanup on unmount
    return () => {
      clearTimers();
    };
  }, [dashboardId]);

  useEffect(() => {
    // Cleanup when component unmounts or plan data is found
    if (planData) {
      clearTimers();
    }
  }, [planData]);

  const getLoadingMessage = () => {
    if (!isRetrying) return "Loading your personalized plan...";
    if (elapsedTime < 15) return "Generating your personalized action plan...";
    if (elapsedTime < 30) return "Adding the finishing touches to your plan...";
    if (elapsedTime < 45) return "Almost ready, finalizing your recommendations...";
    return "Taking a bit longer than usual, but your plan is almost complete...";
  };

  const getProgressPercentage = () => {
    if (!isRetrying) return 0;
    return Math.min((elapsedTime / 60) * 100, 95); // Never show 100% until complete
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            {isRetrying && (
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {getLoadingMessage()}
          </h2>
          
          {isRetrying && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Elapsed time: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-muted-foreground">
                We're finalizing your personalized action plan with custom recommendations based on your answers.
              </p>
              
              <div className="flex gap-2 justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
                
                {elapsedTime > 30 && (
                  <Button 
                    variant="outline" 
                    onClick={handleManualRetry}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-xl mb-4">Plan not found</p>
          <p className="text-muted-foreground">Please check your dashboard ID and try again.</p>
        </div>
      </div>
    );
  }

  // Pass the loaded plan data to the existing Index component
  return <Index userData={planData} />;
};

export default Plan;