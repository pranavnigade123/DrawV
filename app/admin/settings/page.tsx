"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert("Please enter an email address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] pt-20 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Settings</h1>

        {/* Email Configuration */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Email Configuration</h2>
          
          <div className="mb-6">
            <p className="text-zinc-400 mb-4">
              Test your email configuration by sending a test email.
            </p>
            
            <div className="flex gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleTestEmail}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? "Sending..." : "Send Test Email"}
              </button>
            </div>
          </div>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? "bg-emerald-900/20 border border-emerald-800"
                  : "bg-red-900/20 border border-red-800"
              }`}
            >
              <h3
                className={`font-semibold mb-2 ${
                  result.success ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {result.success ? "✅ Success!" : "❌ Error"}
              </h3>
              <p className={result.success ? "text-emerald-200" : "text-red-200"}>
                {result.message || result.error}
              </p>

              {result.help && (
                <div className="mt-3 p-3 bg-zinc-800 rounded text-sm text-zinc-300 whitespace-pre-line">
                  {result.help}
                </div>
              )}

              {result.config && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-300">
                    View Configuration
                  </summary>
                  <div className="mt-2 p-3 bg-zinc-800 rounded text-sm font-mono">
                    {Object.entries(result.config).map(([key, value]) => (
                      <div key={key} className="text-zinc-300">
                        <span className="text-zinc-500">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Email Setup Instructions</h2>
          
          <div className="space-y-4 text-zinc-300">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Add to .env.local:</h3>
              <pre className="bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto">
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Tournament System
SMTP_FROM_EMAIL=your-email@gmail.com`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">2. For Gmail:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to Google Account → Security</li>
                <li>Enable 2-Factor Authentication</li>
                <li>Go to App Passwords: <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-indigo-400 hover:underline">myaccount.google.com/apppasswords</a></li>
                <li>Select "Mail" and "Other (Custom name)"</li>
                <li>Copy the 16-character password</li>
                <li>Use this as SMTP_PASS (not your regular password)</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">3. Other Providers:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>SendGrid:</strong>
                  <code className="ml-2 text-xs bg-zinc-800 px-2 py-1 rounded">
                    SMTP_HOST=smtp.sendgrid.net
                  </code>
                </div>
                <div>
                  <strong>Mailgun:</strong>
                  <code className="ml-2 text-xs bg-zinc-800 px-2 py-1 rounded">
                    SMTP_HOST=smtp.mailgun.org
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4">
              <p className="text-amber-300 text-sm">
                <strong>Note:</strong> After updating .env.local, restart your development server for changes to take effect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
