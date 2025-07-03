import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

export const ReminderDialog = ({ open, onOpenChange, userEmail }: ReminderDialogProps) => {
  const [frequency, setFrequency] = useState<string>("");
  const [email, setEmail] = useState(userEmail);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!frequency || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would connect to your backend/Replit integration
    toast({
      title: "Reminder Set!",
      description: `You'll receive ${frequency} reminders at ${email}`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Progress Reminders</DialogTitle>
          <DialogDescription>
            Stay on track with gentle email reminders about your resilience journey.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use the same email as your Substack subscription
            </p>
          </div>
          
          <div>
            <Label htmlFor="frequency">Reminder Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Set Reminder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};