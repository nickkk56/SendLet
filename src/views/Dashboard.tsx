import { html } from "hono/html";
import type { Subscriber } from "../db/schema";

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
    return html`
      <tr data-id="${s.id}" data-email="${s.email}">
        <td>${s.email}</td>
        <td>${s.subscribedAt.toISOString().split("T")[0]}</td>
        <td>${status}</td>
        <td>${s.source ?? "-"}</td>
        <td>
          <button class="delete-btn" data-id="${s.id}" data-email="${s.email}" style="background:#dc2626;font-size:0.8rem;padding:0.25rem 0.5rem;">Delete</button>
        </td>
      </tr>
    `;
  });

  return html`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sendlet Dashboard</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; background: #f5f5f5; color: #333; }
          .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
          h1 { margin-bottom: 0.5rem; }
          .stats { display: flex; gap: 1rem; margin: 2rem 0; }
          .stat-card { background: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1; }
          .stat-card .label { font-size: 0.8rem; color: #666; text-transform: uppercase; }
          .stat-card .value { font-size: 2rem; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #eee; }
          th { background: #f9f9f9; font-weight: 600; }
          .broadcast { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
          input, textarea { width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; margin-bottom: 0.5rem; box-sizing: border-box; }
          textarea { min-height: 120px; }
          button { background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-family: inherit; }
          button:hover { background: #1d4ed8; }
          #send-result { margin-top: 0.5rem; color: #22c55e; }
        </style>
      </head>
      <body data-auth-token="${authToken}">
        <div class="container">
          <h1>Sendlet Dashboard</h1>

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

          <div class="broadcast">
            <h2 style="margin-top: 0;">Send Broadcast</h2>
            <form id="broadcast-form">
              <input type="text" name="subject" placeholder="Subject" required />
              <textarea name="body" placeholder="Body (HTML allowed)" required></textarea>
              <button type="submit">Send</button>
              <div id="send-result"></div>
            </form>
          </div>

          <h2>Subscribers</h2>
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
