# JSearch API Setup (Optional - for Real Jobs)

The app now uses **JSearch API** which aggregates jobs from:
- LinkedIn
- Indeed  
- Glassdoor
- ZipRecruiter
- Monster
- CareerBuilder

## Current Status

✅ **App works with demo data** (no API key needed)
- Shows 10 realistic job listings
- Uses real company logos via Clearbit
- Fully functional for testing

## To Get Real Jobs (Optional)

### 1. Get Free API Key

1. Go to [RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
2. Click "Subscribe to Test"
3. Choose **FREE plan** (100 requests/month)
4. Copy your API key

### 2. Add to Environment

Create `.env.local` in the `job-hunter-pro` directory:

```bash
JSEARCH_API_KEY=your_api_key_here
```

### 3. Restart Dev Server

```bash
npm run dev
```

That's it! The app will automatically use real jobs from multiple sources.

## Benefits

- ✅ **No CAPTCHA issues** - Direct API access
- ✅ **Multiple sources** - LinkedIn, Indeed, Glassdoor, etc.
- ✅ **Free tier available** - 100 requests/month
- ✅ **Better job data** - Salary ranges, benefits, skills
- ✅ **Works without API key** - Falls back to demo data

## Demo Data

Without an API key, the app shows:
- 10 realistic job listings
- Real company names (Google, Microsoft, Amazon, Meta, Apple)
- Company logos from Clearbit
- Salary ranges based on your profile
- Skills matched to your profile
- Realistic job descriptions
