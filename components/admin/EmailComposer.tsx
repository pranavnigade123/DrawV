"use client";

import { useState } from "react";
import { XMarkIcon, PaperClipIcon, EyeIcon } from "@heroicons/react/24/outline";

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentName: string;
}

export default function EmailComposer({
  isOpen,
  onClose,
  tournamentId,
  tournamentName,
}: EmailComposerProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!title || !message) {
      alert("Please fill in both title and message");
      return;
    }

    if (!confirm(`Send this announcement to all approved participants?`)) {
      return;
    }

    setLoading(true);

    try {
      // For now, we'll send without attachments
      // TODO: Implement attachment upload
      const res = await fetch(`/api/admin/tournaments/${tournamentId}/send-announcement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        setTitle("");
        setMessage("");
        setAttachments([]);
        onClose();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Send Announcement</h2>
            <p className="text-sm text-zinc-400 mt-1">
              To all approved participants of {tournamentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showPreview ? (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Subject / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Tournament Schedule Update"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your announcement message here..."
                  rows={10}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Tip: Use line breaks to format your message. HTML is supported.
                </p>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Attachments (Coming Soon)
                </label>
                <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                  <PaperClipIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500 mb-2">
                    Attachment support coming soon
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-zinc-800 text-zinc-500 rounded-lg cursor-not-allowed"
                  >
                    Select Files
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <PaperClipIcon className="w-5 h-5 text-zinc-400" />
                          <div>
                            <p className="text-sm text-white">{file.name}</p>
                            <p className="text-xs text-zinc-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="p-1 hover:bg-zinc-700 rounded transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="bg-white text-black rounded-lg p-8">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-indigo-600 mb-4">{title || "Subject"}</h2>
                <p className="text-gray-600 mb-4">Hi [Participant Name],</p>
                <div
                  className="bg-gray-50 p-4 rounded-lg mb-4 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: message || "Your message will appear here..." }}
                />
                <a
                  href="#"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg no-underline"
                >
                  View Tournament
                </a>
                <p className="text-sm text-gray-500 mt-6">
                  Tournament: {tournamentName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            <EyeIcon className="w-5 h-5" />
            {showPreview ? "Edit" : "Preview"}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !title || !message}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? "Sending..." : "Send Announcement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
