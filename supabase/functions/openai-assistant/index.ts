import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, threadId, message, assistantId, runId } = await req.json();

    const baseHeaders = {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    };

    let response;

    switch (action) {
      case 'create_thread':
        response = await fetch('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({})
        });
        break;

      case 'add_message':
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            role: 'user',
            content: message
          })
        });
        break;

      case 'create_run':
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            assistant_id: assistantId,
            tools: [
              {
                type: "function",
                function: {
                  name: "generate_user_plan",
                  description: "Generate a personalized user plan JSON based on assessment responses",
                  parameters: {
                    type: "object",
                    properties: {
                      email: { type: "string" },
                      subscriptionTier: { type: "string" },
                      timePerWeek: { type: "string" },
                      monthlyBudget: { type: "string" },
                      style: { type: "string" },
                      skillsHave: { type: "array", items: { type: "string" } },
                      skillsEnjoy: { type: "array", items: { type: "string" } },
                      motivations: { type: "array", items: { type: "string" } },
                      socialSupport: { type: "string" },
                      personaTags: { type: "array", items: { type: "string" } },
                      selectedDomains: { type: "array", items: { type: "string" } },
                      domainData: { type: "object" }
                    },
                    required: ["email", "subscriptionTier", "selectedDomains", "domainData"]
                  }
                }
              }
            ]
          })
        });
        break;

      case 'get_run':
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          method: 'GET',
          headers: baseHeaders
        });
        break;

      case 'get_messages':
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
          method: 'GET',
          headers: baseHeaders
        });
        break;

      case 'submit_tool_outputs':
        const { toolOutputs } = await req.json();
        response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
          method: 'POST',
          headers: baseHeaders,
          body: JSON.stringify({
            tool_outputs: toolOutputs
          })
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Action: ${action}`, data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});