import { html } from "hono/html";
import type { Subscriber } from "../db/schema";
import { config } from "../config";

interface DashboardProps {
  total: number;
  confirmed: number;
  unsubscribed: number;
  subscribers: Subscriber[];
  authToken: string;
}

export function Dashboard(props: DashboardProps) {
  const { total, confirmed, unsubscribed, subscribers, authToken } = props;

  const rows = subscribers.map((s) => {
    const status = s.unsubscribedAt
      ? "Unsubscribed"
      : s.confirmed
        ? "Confirmed"
        : "Unconfirmed";
    const statusColor = s.unsubscribedAt ? "#ef4444" : s.confirmed ? "#22c55e" : "#E8792F";
    return html`
      <tr data-id="${s.id}" data-email="${s.email}">
        <td>${s.email}</td>
        <td>${s.subscribedAt.toISOString().split("T")[0]}</td>
        <td><span style="color: ${statusColor}; font-weight: 500;">${status}</span></td>
        <td>${s.source ?? "-"}</td>
        <td>
          <button class="delete-btn" data-id="${s.id}" data-email="${s.email}">Delete</button>
        </td>
      </tr>
    `;
  });

  return html`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Dashboard — ${config.BRAND_NAME}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --bg-color: #f5f5f7;
            --surface-color: #ffffff;
            --text-main: #1d1d1f;
            --text-secondary: #6e6e73;
            --accent-color: #E8792F;
            --accent-hover: #d26a24;
            --accent-soft: rgba(232, 121, 47, 0.12);
            --border-color: rgba(0, 0, 0, 0.08);
            --border-radius: 16px;
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          body {
            font-family: var(--font-family);
            margin: 0;
            background: var(--bg-color);
            color: var(--text-main);
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 40px 24px;
          }
          .subtitle {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--accent-color);
            font-weight: 600;
            display: block;
            margin-bottom: 8px;
          }
          h1 {
            margin-bottom: 8px;
            font-size: 2rem;
            font-weight: 600;
            line-height: 1.12;
            letter-spacing: -0.02em;
          }
          .header-desc {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin: 0 0 32px;
          }
          .stats {
            display: flex;
            gap: 16px;
            margin: 0 0 32px;
          }
          .stat-card {
            background: var(--surface-color);
            padding: 20px 24px;
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            flex: 1;
          }
          .stat-card .label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 500;
          }
          .stat-card .value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--text-main);
            margin-top: 4px;
          }
          .card {
            background: var(--surface-color);
            padding: 28px;
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
            margin-bottom: 32px;
          }
          h2 {
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 1.25rem;
            font-weight: 600;
            line-height: 1.12;
            letter-spacing: -0.02em;
          }
          input, textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-family: inherit;
            font-size: 0.95rem;
            margin-bottom: 12px;
            box-sizing: border-box;
            background: var(--bg-color);
            color: var(--text-main);
            transition: border-color 0.2s ease;
          }
          input:focus, textarea:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px var(--accent-soft);
          }
          textarea {
            min-height: 140px;
            resize: vertical;
          }
          .btn {
            display: inline-block;
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 14px 30px;
            border-radius: 980px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.9rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            transition: background 0.2s ease, transform 0.2s ease;
          }
          .btn:hover {
            background: var(--accent-hover);
            transform: scale(1.02);
          }
          .delete-btn {
            background: transparent;
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 6px 14px;
            font-size: 0.8rem;
            font-weight: 500;
            border-radius: 980px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s ease;
          }
          .delete-btn:hover {
            background: #ef4444;
            color: white;
            border-color: #ef4444;
          }
          .export-btns {
            display: flex;
            gap: 8px;
            margin-top: 8px;
          }
          .export-btn {
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
            padding: 8px 16px;
            font-size: 0.85rem;
            font-weight: 500;
            border-radius: 980px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s ease;
            text-decoration: none;
          }
          .export-btn:hover {
            background: var(--accent-soft);
            color: var(--accent-color);
            border-color: var(--accent-color);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.9rem;
          }
          th {
            background: transparent;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            font-size: 0.7rem;
            letter-spacing: 1px;
          }
          tr:hover td {
            background: rgba(0, 0, 0, 0.02);
          }
          #send-result {
            margin-top: 12px;
            color: #22c55e;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body data-auth-token="${authToken}">
        <div class="container">
          <span class="subtitle">Mailing List</span>
          <h1>Dashboard</h1>
          <p class="header-desc">Manage subscribers and send broadcast emails.</p>

          <div class="stats">
            <div class="stat-card">
              <div class="label">Total</div>
              <div class="value">${total}</div>
            </div>
            <div class="stat-card">
              <div class="label">Confirmed</div>
              <div class="value">${confirmed}</div>
            </div>
            <div class="stat-card">
              <div class="label">Unsubscribed</div>
              <div class="value">${unsubscribed}</div>
            </div>
          </div>

          <div class="card">
            <h2>Send Broadcast</h2>
            <form id="broadcast-form">
              <input type="text" name="subject" placeholder="Subject" required />
              <textarea name="body" placeholder="Body (HTML allowed)" required></textarea>
              <button type="submit" class="btn">Send</button>
              <div id="send-result"></div>
            </form>
          </div>

          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2>Subscribers</h2>
              <div class="export-btns">
                <a href="/dashboard/subscribers/export/csv?password=${authToken}" class="export-btn">Export CSV</a>
                <a href="/dashboard/subscribers/export/json?password=${authToken}" class="export-btn">Export JSON</a>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subscribed</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>

        <script>
          var AUTH_TOKEN = document.body.getAttribute('data-auth-token') || '';

          // Delete button handlers
          document.querySelectorAll('.delete-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
              var id = btn.getAttribute('data-id');
              var email = btn.getAttribute('data-email');
              if (!confirm('Delete subscriber ' + email + '?')) return;

              fetch('/dashboard/subscribers/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN }
              }).then(function(res) {
                if (res.ok) {
                  location.reload();
                } else {
                  return res.json().then(function(data) {
                    alert(data.error || 'Failed to delete subscriber');
                  });
                }
              }).catch(function(err) {
                alert('Error deleting subscriber: ' + err.message);
              });
            });
          });

          // Broadcast form handler
          document.getElementById('broadcast-form').addEventListener('submit', function(e) {
            e.preventDefault();
            var form = e.target;
            var subject = form.subject.value;
            var body = form.body.value;
            var result = document.getElementById('send-result');
            result.textContent = 'Sending...';

            fetch('/dashboard/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AUTH_TOKEN
              },
              body: JSON.stringify({ subject: subject, body: body })
            }).then(function(res) {
              if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                  window.location.href = '/dashboard/login?error=1';
                  return null;
                }
                return res.json().then(function(data) {
                  result.textContent = 'Error: ' + (data.error || 'Failed to send');
                  return null;
                });
              }
              return res.json();
            }).then(function(data) {
              if (!data) return;
              var msg = 'Sent to ' + data.sent + ', failed ' + data.failed;
              if (data.errors && data.errors.length > 0) {
                msg += ' (' + data.errors.slice(0, 3).join('; ') + ')';
              }
              result.textContent = msg;
              form.reset();
            }).catch(function(err) {
              result.textContent = 'Error sending: ' + (err.message || err);
            });
          });
        </script>
      </body>
    </html>
  `;
}
