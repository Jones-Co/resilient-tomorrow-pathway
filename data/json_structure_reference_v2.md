### json_structure_reference.md

This is the expected structure of the `user_plan.json` file created in the background by the Off-Ramp GPT assistant.

```json
{
  "email": "user@example.com",
  "subscriptionTier": "Free",
  "status": "Active",
  "timePerWeek": "15 minutes",
  "monthlyBudget": "$0",
  "style": "researching",
  "skillsHave": ["basic gardening"],
  "skillsEnjoy": ["researching", "organizing"],
  "motivations": ["reduce dependence", "care for community"],
  "socialSupport": "no",
  "personaTags": ["Systems Thinker", "Independent"],
  "selectedDomains": ["Food", "Money"],
  "domainData": {
    "Food": {
      "summary": "Reclaiming food means growing, trading, or sourcing outside fragile supply chains.",
      "actions": {
        "level0": [
          {"task": "Visit a farmers market this weekend", "time": "1 hr", "cost": "$20", "impact": "low", "source": "7 Steps to Quietly Exit a System", "categoryTags": ["local", "seasonal"]}
        ],
        "level1": [],
        "level2": [],
        "level3": []
      },
      "completed": []
    },
    "Money": {
      "summary": "Resilience with money means reducing reliance on fragile financial systems.",
      "actions": {
        "level0": [],
        "level1": [],
        "level2": [],
        "level3": []
      },
      "completed": []
    }
  }
}
```

### Matching Rules
- Filter actions using:
  - `available_time` (limits depth)
  - `income_range` (filters cost)
  - `skills_enjoy` (boosts relevance)
  - `motivations` and `personaTags` (used to recommend tone-aligned actions)

- Use `article_index.json` and per-article JSONs to source actions
- If domain has too few actions at a level, leave it short
- Skip domains not selected
- Do not show this JSON unless user explicitly asks

### 🔁 Webhook Sync Function

@function sendUserPlanToWebhook(userPlan)
POST [https://jonesco.app.n8n.cloud/webhook/save-plan](https://jonesco.app.n8n.cloud/webhook-test/save-plan)
Content-Type: application/json
Body:
{
"email": userPlan.email,
"subscriptionTier": userPlan.subscriptionTier,
"timePerWeek": userPlan.timePerWeek,
"monthlyBudget": userPlan.monthlyBudget,
"style": userPlan.style,
"skillsHave": userPlan.skillsHave,
"skillsEnjoy": userPlan.skillsEnjoy,
"motivations": userPlan.motivations,
"socialSupport": userPlan.socialSupport,
"personaTags": userPlan.personaTags,
"selectedDomains": userPlan.selectedDomains,
"domainData": userPlan.domainData,
"lastUpdated": "{{now}}"
}

Call this function any time the userPlan is created or updated.
---

This structure enables a user-facing dashboard to reflect suggested and completed steps by domain, encourage progress, and track growth over time.

