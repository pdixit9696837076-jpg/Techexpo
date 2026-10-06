# Deploy GramVyapar on Render

GramVyapar includes a Node.js server for login, account creation, and the dashboard API. GitHub Pages only serves static files, so it cannot run these features by itself.

## Create the live site

1. Push this project to your GitHub repository.
2. In Render, choose **New** > **Blueprint** and connect that repository.
3. Render will read `render.yaml`; choose **Apply** to create the free web service.
4. Wait for the deploy to finish, then open the `onrender.com` URL shown on the service page.

The service serves both the website and its API from the same URL, so no local `localhost:3000` server is needed in the browser.

## Optional AI chat setup

In the Render service's **Environment** settings, add `GEMINI_API_KEY` with your Google AI Studio key, then redeploy. Do not put the key in frontend files or commit it to GitHub.

## Free-tier data note

The free service stores accounts and chat history in its local SQLite database. That filesystem is temporary, so data can be lost when the service restarts or is redeployed. Use persistent storage and a production database before relying on it for real users.
