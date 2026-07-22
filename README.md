# Sema Serikali

Know what is happening. Understand what it means. Make your voice heard.

An AI-powered civic information platform that collects public updates from
trusted Kenyan sources and uses **Gemma 4** to turn them into simple,
structured information ordinary citizens can actually understand and act
on.

Stack: **MongoDB, Express, React, Node** (MERN) + **Gemma 4**, called
through Google's hosted **Gemini API** (no local model, no GPU needed).

> Earlier versions of this project ran Gemma 4 locally through Ollama.
> That has been replaced with the hosted API below so it runs reliably on
> any laptop, with no local model download and no risk of the machine
> hanging mid-demo. The UI, features, and everything the app does are
> unchanged - only where Gemma actually runs is different.

---

## 1. What you need installed

1. **Node.js** (v18 or newer - it must have the built-in `fetch`)
2. **MongoDB** (a local database)
3. **A free Gemma 4 API key** from Google AI Studio (no install - just a key)

### 1.1 Install Node.js

Check if you already have a new enough version:

```bash
node -v
```

If that shows nothing, or a version below 18, install Node 20 via
NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should print v20.x.x
```

### 1.2 Install MongoDB

```bash
# Import MongoDB's GPG key and add its repository
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB now, and make it start automatically on every boot
sudo systemctl start mongod
sudo systemctl enable mongod

# Confirm it's running
sudo systemctl status mongod
```

If your Ubuntu version isn't `jammy` (22.04), check `lsb_release -cs` and
swap that word into the line above (e.g. `noble` for 24.04). If in doubt,
`sudo apt install -y mongodb` (the older distro package) also works fine
for a hackathon.

### 1.3 Getting a Gemma 4 API key

1. Go to **https://aistudio.google.com** and sign in with a Google account.
2. Click **Get API key** (usually top-left or under your profile menu).
3. Click **Create API key**, choose or create a Google Cloud project when
   prompted, and copy the key it gives you.
4. Keep this key private - anyone with it can use your quota. Never commit
   it to a public repo (the included `.gitignore` already excludes `.env`,
   which is where the key lives).

Google AI Studio's free tier is enough for a hackathon demo - seeding ~8
articles plus live Ask Sema / Have Your Say calls during a presentation is
a small number of requests.

You can also confirm your key works directly, without our app, by running:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{ "contents": [{ "parts": [{"text": "Say hello in one sentence."}] }] }'
```

If that returns a JSON object with a `candidates[0].content.parts[0].text`
field, your key is good.

---

## 2. Project setup

### 2.1 Backend

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and paste your real key into `GOOGLE_API_KEY=`. Everything
else can stay as the default.

### 2.2 Seed the database

This step sends each of the demo articles in `server/seed/seedData.js`
through Gemma 4 (via the API) and saves the simplified result into
MongoDB. Run it once, ahead of your demo:

```bash
npm run seed
```

You should see progress logs like:

```
[seed] -> "Public Participation on the County Governments (Amendment) Bill"
[seed]    done.
```

If you see errors, check that: MongoDB is running
(`sudo systemctl status mongod`), your `GOOGLE_API_KEY` in `.env` is
correct, and you have internet access (this now calls Google's servers,
not a local model).

### 2.3 Start the backend

```bash
npm start
```

You should see:

```
[db] connected to MongoDB at mongodb://127.0.0.1:27017/sema_serikali
[server] Sema Serikali API listening on http://localhost:5000
```

Leave this running in its own terminal.

### 2.4 Frontend

In a **new terminal**:

```bash
cd client
npm install
npm run dev
```

Open the URL it prints (usually **http://localhost:5173**) in your
browser. That's the whole app - UI and behaviour are unchanged from
before, it's just powered by the hosted API underneath now.

---

## 3. How the pieces fit together

```
server/seed/seedData.js   -->  raw "scraped" articles (demo data standing in
                                 for KNA, Parliament, Health, Education)
        |
        v
server/services/gemmaService.js  -->  sends each article to Gemma 4 via the
                                        Gemini API, asks for a simplified,
                                        structured version
        |
        v
MongoDB (CivicUpdate collection)  -->  stores BOTH the original text and
                                         Gemma's simplified version
        |
        v
server/routes/updates.js  -->  Express API the frontend reads from
        |
        v
client/ (React)  -->  homepage feed, "Understand this update" page,
                        Ask Sema, Have Your Say
```

Two features call Gemma **live**, while you use the app, instead of ahead
of time:

- **Ask Sema** (`server/routes/askSema.js`) - explains any text you paste in.
- **Have Your Say** (`server/routes/haveYourSay.js`) - restructures your own
  opinion, without changing what you actually said. This is what powers
  the "Get AI Help" button in that panel.

Both of these need your machine to have internet access and a valid
`GOOGLE_API_KEY` at the moment they're clicked, since they call the API in
real time rather than reading from the database.

---

## 4. Going from demo data to real scraping (optional, if you have time)

`server/seed/seedData.js` contains realistic sample articles instead of
live-scraped content from the four government sites. This was a
deliberate choice: reliably scraping four different, unfamiliar government
websites and having that work live during a judged demo is a real risk,
and everything downstream (Gemma processing, storage, the whole UI) is
100% functional regardless of where the raw text came from.

If you want to extend this after the core is working: install `cheerio`
(`npm install cheerio` in `/server`), write a small function per source
that fetches the page and extracts article titles/links/dates into the
same shape as the objects in `seedData.js`, and call `npm run seed` again.

---

## 5. Troubleshooting

| Problem | Likely fix |
|---|---|
| `npm run seed` errors with "GOOGLE_API_KEY is missing" | Make sure you copied `.env.example` to `.env` and pasted your real key into it. |
| `npm run seed` errors with "Gemma API request failed (400/403)" | Your API key is invalid, or the project it belongs to doesn't have the Gemini API enabled - go back to Google AI Studio and re-check the key. |
| `npm run seed` errors with "Gemma API request failed (429)" | You've hit the free tier's rate limit - wait a minute and re-run, or space out requests. |
| `[db] failed to connect to MongoDB` | Run `sudo systemctl start mongod`, then `sudo systemctl status mongod` to confirm it's active. |
| Frontend loads but shows "No updates yet" | You haven't run `npm run seed` in `/server` yet, or it failed - check the terminal output from that command. |
| Ask Sema / "Get AI Help" button shows an error | The backend (`npm start` in `/server`) isn't running, your `GOOGLE_API_KEY` is missing/invalid, or you have no internet connection. |
| Gemma replies feel slow | `gemma-4-26b-a4b-it` (the default) is the faster of the two hosted variants - if you switched to `gemma-4-31b-it`, switch back for live demo use. |
