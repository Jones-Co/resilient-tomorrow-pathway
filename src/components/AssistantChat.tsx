import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssistantChatProps {
  onPlanGenerated: (plan: any) => void;
}

const AssistantChat: React.FC<AssistantChatProps> = ({ onPlanGenerated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Your GPT Assistant ID - you'll need to create this in OpenAI and update here
  const ASSISTANT_ID = "asst_b5DNvfmHPPeyaCjpvJKewaBp";

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Create a new thread
      const { data: threadData, error } = await supabase.functions.invoke('openai-assistant', {
        body: { action: 'create_thread' }
      });

      if (error) throw error;

      setThreadId(threadData.id);
      setIsInitialized(true);
      
      // Add welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m here to help you create a personalized resilience plan. I\'ll ask you some questions about your goals, skills, and preferences to build a custom plan across seven domains: Food, Power, Money, Community, Communication, Knowledge, and Narrative. Let\'s start - what brings you here today?',
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !threadId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Add message to thread
      await supabase.functions.invoke('openai-assistant', {
        body: {
          action: 'add_message',
          threadId,
          message: inputMessage
        }
      });

      // Create run
      const { data: runData, error: runError } = await supabase.functions.invoke('openai-assistant', {
        body: {
          action: 'create_run',
          threadId,
          assistantId: ASSISTANT_ID
        }
      });

      if (runError) throw runError;

      // Poll for completion
      await pollRunStatus(runData.id);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollRunStatus = async (runId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const { data: runStatus, error } = await supabase.functions.invoke('openai-assistant', {
          body: {
            action: 'get_run',
            threadId,
            runId
          }
        });

        if (error) throw error;

        if (runStatus.status === 'completed') {
          await fetchMessages();
          return;
        } else if (runStatus.status === 'requires_action') {
          await handleRequiredAction(runId, runStatus.required_action);
          return;
        } else if (runStatus.status === 'failed') {
          throw new Error('Run failed');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        console.error('Error polling run status:', error);
        break;
      }
    }
  };

  const handleRequiredAction = async (runId: string, requiredAction: any) => {
    const toolCalls = requiredAction.submit_tool_outputs.tool_calls;
    const toolOutputs = [];

    for (const toolCall of toolCalls) {
      if (toolCall.function.name === 'generate_user_plan') {
        try {
          const planData = JSON.parse(toolCall.function.arguments);
          console.log('Generated plan:', planData);
          
          // Notify parent component
          onPlanGenerated(planData);
          
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: 'Plan generated successfully and ready for submission.'
          });
        } catch (error) {
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: 'Error generating plan. Please try again.'
          });
        }
      }
    }

    // Submit tool outputs
    await supabase.functions.invoke('openai-assistant', {
      body: {
        action: 'submit_tool_outputs',
        threadId,
        runId,
        toolOutputs
      }
    });

    // Continue polling
    await pollRunStatus(runId);
  };

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase.functions.invoke('openai-assistant', {
        body: {
          action: 'get_messages',
          threadId
        }
      });

      if (error) throw error;

      const formattedMessages: Message[] = messagesData.data
        .filter((msg: any) => msg.role !== 'user' || msg.content[0]?.text?.value)
        .map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content[0]?.text?.value || '',
          timestamp: new Date(msg.created_at * 1000)
        }))
        .reverse();

      // Only add new assistant messages
      setMessages(prev => {
        const lastUserMessage = prev[prev.length - 1];
        const newAssistantMessages = formattedMessages.filter(
          msg => msg.role === 'assistant' && 
          new Date(msg.timestamp) > new Date(lastUserMessage.timestamp)
        );
        return [...prev, ...newAssistantMessages];
      });

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isInitialized) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Initializing chat...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 p-4 flex flex-col min-h-0">
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="flex gap-2 mt-4 flex-shrink-0">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssistantChat;