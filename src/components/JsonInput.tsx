import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface JsonInputProps {
  onJsonUpdate: (data: any) => void;
  currentData: any;
}

export const JsonInput = ({ onJsonUpdate, currentData }: JsonInputProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleJsonSubmit = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "No JSON provided",
        description: "Please enter JSON data to update the dashboard",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedData = JSON.parse(jsonInput);
      onJsonUpdate(parsedData);
      toast({
        title: "Success!",
        description: "Dashboard updated with new JSON data",
      });
      setIsExpanded(false);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setJsonInput("");
    // Reset to original mock data - this will be handled by parent component
    onJsonUpdate(null);
    toast({
      title: "Reset complete",
      description: "Dashboard restored to demo data",
    });
  };

  if (!isExpanded) {
    return (
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          🧪 Test with Custom JSON Data
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Test with Custom JSON
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="json-input">Paste your JSON data:</Label>
          <Textarea
            id="json-input"
            placeholder={`Example format:\n{\n  "email": "test@example.com",\n  "subscriptionTier": "Paid",\n  "status": "Active",\n  "selectedDomains": ["Food", "Power"],\n  "domainData": {\n    "Food": {\n      "summary": "...",\n      "actions": {...},\n      "completed": [...]\n    }\n  }\n}`}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleJsonSubmit} className="flex-1">
            Update Dashboard
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset to Demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};