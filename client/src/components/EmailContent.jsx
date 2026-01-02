import React from "react";
import { ArrowLeft, Reply, Share2, Trash2 } from "lucide-react";
import { format } from "date-fns";

const EmailContent = ({ email }) => {
  if (!email)
    return <div className="p-6 text-neutral-500">Select an email to view</div>;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
        <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-100 transition duration-150">
          <ArrowLeft className="w-5 h-5 text-neutral-900" />
          <span className="text-sm font-medium text-neutral-900">Back</span>
        </button>

        <div className="flex gap-3">
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 transition duration-150">
            <Reply className="w-5 h-5 text-neutral-900" />
            <span className="text-sm font-medium text-neutral-900">Reply</span>
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 transition duration-150">
            <Share2 className="w-5 h-5 text-neutral-900" />
            <span className="text-sm font-medium text-neutral-900">
              Forward
            </span>
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition duration-150">
            <Trash2 className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-600">Delete</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-neutral-200">
        <h1 className="text-lg font-semibold text-neutral-900 truncate">
          {email.subject}
        </h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1 gap-1 sm:gap-0">
          <span className="text-sm text-neutral-600">{email.from}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">
              {format(new Date(email.date), "MMM d, yyyy HH:mm")}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 capitalize">
              {email.category}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 overflow-y-auto flex-1 whitespace-pre-line text-neutral-800">
        {email.body}
      </div>
    </div>
  );
};

export default EmailContent;
