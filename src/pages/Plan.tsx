import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Index from "./Index";

const Plan = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlanData = async () => {
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
          .single();

        if (error) {
          console.error("Error fetching plan:", error);
          toast({
            title: "Error Loading Plan",
            description: "Failed to load your personalized plan.",
            variant: "destructive",
          });
        } else if (data) {
          setPlanData(data.plan_data);
        } else {
          toast({
            title: "Plan Not Found",
            description: "The requested plan could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        toast({
          title: "Error Loading Plan",
          description: "Failed to load your personalized plan.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [dashboardId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading your personalized plan...</p>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Plan not found</p>
          <p className="text-slate-400">Please check your dashboard ID and try again.</p>
        </div>
      </div>
    );
  }

  // Pass the loaded plan data to the existing Index component
  return <Index userData={planData} />;
};

export default Plan;