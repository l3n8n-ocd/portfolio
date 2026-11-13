# Make It Do Something: Contact Dispatch Form

**Feature:** 15-Minute Technical Walkthrough & Direct Message Dispatch Form
**Where it lives:** the `#contact` section of https://l3n8n-ocd.github.io/portfolio/
**Code:** [`src/components/ContactDispatchForm.jsx`](../src/components/ContactDispatchForm.jsx), mounted in [`src/components/Contact.jsx`](../src/components/Contact.jsx)
**Cost:** $0 (GitHub Pages + FormSubmit.co free tier)

---

## Section 1: The Plain-Words Explainer

### 1. What a backend is

The frontend is the part of a website that runs inside the visitor's browser: the text, buttons, colors and form fields. Anyone can open DevTools and read every line of it, including the JavaScript.

A backend is a program running on a server somewhere else on the internet. It does the jobs the browser can't be trusted with: holding passwords and API keys, talking to databases, and logging in to other services.

Sending email is one of those jobs. To send mail, a program has to log in to a mail server (SMTP) with a username and password. My portfolio is a static React + Vite bundle on GitHub Pages, so it is just files handed to the browser. If I put my Gmail password in that bundle, every visitor could read it. Browsers also can't open an SMTP connection at all. So the site can't send email by itself. It needs a backend.

### 2. What my feature does

Before this, the contact form on my portfolio only pretended to work: it checked the fields and showed "sent", but nothing left the browser. Now it actually delivers.

An engineering manager or recruiter fills in their name, reply-to email, a walkthrough topic (MicroCredit API, Node2Shell CVE research, a Cloud Security / DevSecOps role, or a general question) and a message with a preferred 15-minute time window. They press Send and the message lands in my Gmail inbox. They don't have to open a mail app or copy my address.

This is the one action my portfolio exists for: getting someone who's interested to start a conversation with me. After sending, they see a receipt with the time, a request ID and their details. A collapsible panel shows the exact request that was sent and the response the server sent back.

### 3. How the data flows, step by step

1. **Typing:** each field is stored in React state as the visitor types.
2. **Checking:** when they press Send, the browser checks that every field is filled in and the email looks valid. A hidden "honeypot" field that people never see catches bots: if it has anything in it, nothing is sent. The button locks so a double-click can't send twice.
3. **Packaging:** the fields go into a JSON object along with a request ID. The ID is made by hashing the message contents, so the same message always gets the same ID. The object is turned into a JSON string.
4. **Sending:** the browser sends that string in an HTTPS POST request to FormSubmit.co, a free form-relay service. HTTPS encrypts it on the way.
5. **Relaying:** FormSubmit's server checks the request and emails the contents to `ladriano0209@gmail.com` over SMTP, using its own mail credentials, not mine.
6. **Answering:** FormSubmit replies with `200 OK` and a small JSON body (`"success": "true"`).
7. **Showing it:** React switches the form from "submitting" to "succeeded" and shows the green receipt. If anything fails, it shows the error and the raw response instead of pretending it worked.

---

## Section 2: Architecture and code reference

### Data flow

```
 Visitor's browser (GitHub Pages: static files only, no secrets)
 ┌────────────────────────────────────────────────────────────┐
 │ 1. Form state      name · email · walkthroughTopic · msg   │
 │        │                                                   │
 │ 2. Validate        required · email format · _honey empty  │
 │        │           double-submit lock (status: submitting) │
 │ 3. Serialize       JSON.stringify({ ..., request_id })     │
 └────────┼───────────────────────────────────────────────────┘
          │  4. HTTPS POST  Content-Type: application/json
          ▼
 ┌────────────────────────────────────────────────────────────┐
 │ Free-tier relay backend: FormSubmit.co (or Web3Forms)      │
 │ 5. Check payload, then send mail with ITS OWN credentials  │
 └────────┬──────────────────────────────┬────────────────────┘
          │ SMTP                         │ 6. 200 OK + JSON
          ▼                              ▼
 ┌────────────────────────┐   ┌──────────────────────────────┐
 │ ladriano0209@gmail.com │   │ 7. React: submitting →        │
 │ (my inbox)             │   │    succeeded, render receipt │
 └────────────────────────┘   └──────────────────────────────┘
```

### Where each part lives in `ContactDispatchForm.jsx`

| Part | What it does |
| --- | --- |
| `validate()` | Required fields, email format, length limits. Errors show under each field. |
| `_honey` field | Hidden spam trap. If it's filled, nothing is sent. |
| `deriveRequestId()` | SHA-256 of the message contents, shortened to `req_` + 16 hex characters. Shown as the **X-Idempotency-Key** badge, sent as `request_id` in the body and included in the email. If the same message was already delivered in this visit, it isn't sent again. |
| `status` | `'idle' \| 'submitting' \| 'succeeded' \| 'error'`. While `submitting`, the fields and button are disabled and the button reads "Dispatching over HTTPS...". A `useRef` lock also blocks a second submit before React re-renders. |
| `buildRequest()` | Builds the JSON body. The keys are the row labels of the email table (Name / Organization, Reply-To Email, Walkthrough Topic, Message / Preferred Time Window, Submitted (UTC), Request ID, Sent From), so the email reads like a formal request. The subject includes the topic and sender, e.g. `[Portfolio Dispatch] New Walkthrough Request: General Inquiry (Jane Doe)`. FormSubmit also gets `_replyto`, `_template: table` and `_honey`; Web3Forms gets `access_key`, `from_name` and `replyto`. |
| `fetch()` call | `POST` with `Content-Type: application/json` and `Accept: application/json`, plus a 45-second timeout. FormSubmit can be slow to answer, and a timeout doesn't mean the email wasn't sent. |
| `isRelaySuccess()` | Counts it as delivered only if the HTTP status is 2xx **and** the JSON says `success: true`. FormSubmit can return `200` with `success: "false"`, for example before the form is activated. |
| `TelemetryDrawer` | The collapsible "How This Data Just Flowed" panel: request line, headers, cleaned-up JSON body (honeypot removed, access key masked), response status, timing and response body. |

**Why the request ID goes in the body, not as an `X-Idempotency-Key` header:** a custom header makes the browser send a CORS pre-check to the relay, and I can't confirm that FormSubmit or Web3Forms allow that header. If they don't, every submission would fail. In the body it works with both relays, and it shows up in the email, so I can match an email to the receipt the sender saw.

### Configuration

- **Default:** FormSubmit.co at `https://formsubmit.co/ajax/cae75c4e129755785e3fe37c2f283c55`. That string is the alias FormSubmit issued for my inbox in its activation email, so my address isn't in the request URL. It only works after the one-time activation below.
- **Optional Web3Forms override:** set `VITE_WEB3FORMS_ACCESS_KEY` when building. Vite bakes it into the bundle, so it's public by design: Web3Forms access keys only allow sending to the address the key was created for. Locally, put it in `.env.local`. For the deployed site, the GitHub Actions build step has to receive it as an environment variable, which `.github/workflows/deploy.yml` doesn't do yet.

---

## Section 3: End-to-end test log

### One-time setup: activate FormSubmit

FormSubmit doesn't forward anything for a new address until the owner confirms it.

1. Open the live site and send one test message from the form.
2. The form shows an error saying the relay needs activation. That's expected.
3. In `ladriano0209@gmail.com`, open the email from FormSubmit and click **Activate Form**. Check Spam/Promotions if it isn't in the inbox.
4. Send the test message again. From now on, messages are delivered.

### Test procedure

1. Open https://l3n8n-ocd.github.io/portfolio/#contact in a normal browser window.
2. Open DevTools → **Network** and filter by `formsubmit`.
3. Fill in the form with a recognizable message, such as `E2E test <date>`, and press **Send Message**.
4. Check the browser, then check the inbox.

### Verification checklist

| Check | Expected | Result |
| --- | --- | --- |
| Empty submit | 4 field errors, no network request | ☐ |
| Button while sending | Reads "Dispatching over HTTPS...", disabled; double-click sends **one** request | ☐ |
| Network tab | One `POST` to `formsubmit.co/ajax/...`, status `200` | ☐ |
| Receipt card | Green "Delivery Confirmed" with UTC time, request ID, sender, topic | ☐ |
| Telemetry drawer | Shows `200 OK`, timing, request JSON and `{"success":"true", ...}` | ☐ |
| Gmail inbox | Email with subject `[Portfolio Dispatch] New Walkthrough Request` from FormSubmit | ☐ |
| Request ID matches | `request_id` in the email = request ID on the receipt | ☐ |
| Reply-To | Hitting Reply in Gmail addresses the sender's email | ☐ |
| Same message again | Blocked with "already delivered", no new request | ☐ |
| Light mode | Form, receipt and drawer readable after toggling the theme | ☐ |

### Recorded run

Fill this in from a real submission on the live site:

```
Date/time (UTC):       ____________________
Request ID (receipt):  req_________________
HTTP status (drawer):  ___ ________
Round trip (drawer):   ______ ms
Email received at:     ____________________ (Gmail timestamp)
Email request_id:      req_________________
```

Add two screenshots next to this file: the receipt with the drawer open (`docs/e2e-receipt.png`), and the email in Gmail (`docs/e2e-inbox.png`).
