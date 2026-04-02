# LLM Model Tracker

A modern SaaS dashboard for tracking and monitoring Large Language Models from major providers including OpenAI, Anthropic, Google Gemini, Azure OpenAI, xAI, and Amazon Bedrock.

## Features

- **Real-time Model Tracking**: Automatically scrapes official provider websites for the latest model information
- **Deprecation Alerts**: Get notified about upcoming model deprecations with countdown timers
- **Provider Comparison**: Compare models across different providers side-by-side
- **Auto-updates**: Scheduled data refreshes 3 times daily (9am, 2pm, 6pm UTC)
- **Interactive Dashboard**: Clean, modern UI with charts and data visualization
- **Alerts System**: Automatic alerts for new models and upcoming deprecations

## Architecture

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Custom SVG charts** for data visualization
- **Real-time data hooks** for live updates

### Backend
- **Supabase Edge Functions** powered by Deno
- **Hono** web framework for API routes
- **PostgreSQL** key-value store for data persistence
- **Web scraping** from official provider documentation

## Data Sources

The tracker pulls data from official sources:

### OpenAI
- Models: https://platform.openai.com/docs/models
- Deprecations: https://platform.openai.com/docs/deprecations

### Google Gemini
- Models: https://ai.google.dev/gemini-api/docs/models
- Changelog: https://ai.google.dev/gemini-api/docs/changelog
- Vertex AI: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models

### Anthropic (Claude)
- Deprecation Policy: https://www.anthropic.com/research/deprecation-commitments
- AWS Bedrock Docs: https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-claude.html

### Azure OpenAI
- Models: https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
- Reasoning: https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/reasoning

### Amazon Bedrock
- Supported Models: https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html
- Documentation: https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html

## API Endpoints

### GET `/make-server-6d10c21b/models`
Returns all tracked models with details.

**Response:**
```json
{
  "models": [...],
  "lastUpdated": "2026-04-01T12:00:00Z",
  "count": 25
}
```

### GET `/make-server-6d10c21b/deprecations`
Returns deprecation information.

**Response:**
```json
{
  "deprecations": [...],
  "lastUpdated": "2026-04-01T12:00:00Z",
  "count": 5
}
```

### GET `/make-server-6d10c21b/alerts`
Returns active alerts for new models and deprecations.

**Response:**
```json
{
  "alerts": [...],
  "count": 3
}
```

### POST `/make-server-6d10c21b/scrape`
Manually trigger a data scraping operation.

**Response:**
```json
{
  "success": true,
  "message": "Data scraping completed successfully",
  "timestamp": "2026-04-01T12:00:00Z"
}
```

### GET `/make-server-6d10c21b/scrape-status`
Get the status of the last scraping operation.

**Response:**
```json
{
  "status": "completed",
  "lastRun": "2026-04-01T12:00:00Z",
  "duration": "5.23s",
  "modelsCount": 25,
  "deprecationsCount": 5,
  "alertsCount": 3
}
```

## Deployment

### Supabase Setup

1. Your Supabase project is already configured with:
   - Project ID: `oxswewcxnpvcnnnfbdtu`
   - Database table: `kv_store_6d10c21b`
   - Edge Function: Running at `/functions/v1/make-server-6d10c21b`

2. The backend automatically:
   - Runs an initial data scrape on startup
   - Schedules updates 3 times daily (9am, 2pm, 6pm UTC)
   - Stores data in the PostgreSQL database
   - Provides REST API endpoints for the frontend

### Automatic Updates

The system runs automated data scraping on the following schedule:

- **9:00 AM UTC** - Morning update
- **2:00 PM UTC** - Afternoon update
- **6:00 PM UTC** - Evening update

You can also trigger manual updates using the **"Update Now"** button in the dashboard.

## Usage

### Dashboard
- View all active models across providers
- See deprecation warnings and countdown timers
- Track new model releases in the last 30 days
- View statistics and trends

### Providers Page
- Filter models by specific provider
- View provider-specific statistics
- Compare provider activity

### Compare Models
- Select multiple models for side-by-side comparison
- Compare context windows, pricing, and capabilities
- Make informed decisions about model selection

### Alerts Page
- View all active alerts
- Filter by type (deprecation, new model, update)
- Filter by severity (high, medium, low)
- Mark alerts as read/unread

## Development

### Frontend Development
The frontend automatically fetches data from the backend every 5 minutes and on page load.

### Adding New Providers
To add a new provider, update `/supabase/functions/server/scrapers.tsx`:

1. Create a new scraper function
2. Add it to `fetchAllModels()`
3. Update the provider emoji map in the dashboard

### Customizing Scraping Schedule
Edit the `initializeScheduledScraping()` function in `/supabase/functions/server/index.tsx` to change scraping times.

## Important Notes

⚠️ **This is a prototype built with Figma Make** - It's designed for prototyping and learning purposes.

- Do not use for production without proper security review
- Do not store sensitive data or PII
- Web scraping may break if provider websites change structure
- Consider using official APIs when available

## Future Enhancements

- Add email/webhook notifications for critical alerts
- Implement user accounts and preferences
- Add model performance benchmarks
- Include pricing calculator
- Support for more LLM providers
- Historical data tracking and trends
- Export capabilities (CSV, JSON)

## Support

For issues or questions:
1. Check the scrape status endpoint
2. Review browser console for errors
3. Manually trigger a data refresh
4. Check Supabase Edge Function logs

## License

MIT License - Built for educational and prototyping purposes.
