# Deploy GramVyapar on Render

GramVyapar includes a Node.js server for login, account creation, and the dashboard API. GitHub Pages only serves static files, so it cannot run the real backend.

## GitHub Pages presentation demo

The GitHub Pages site includes a browser-only presentation demo. Visitors can create a demo account, log in, use a generated demo OTP, and open the dashboard. Demo accounts, cart items, and chat history stay in that browser only; OTP is displayed on the page, and AI chat is replaced with a sample response. The site displays a notice explaining these limitations. Do not use real passwords or sensitive personal information in this demo.

To test the Pages demo locally while running the Node server, open `http://localhost:3000/login.html?pages-demo=1`. The demo switch lasts for that browser tab; ordinary local use without the query parameter continues to use the real API.

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
