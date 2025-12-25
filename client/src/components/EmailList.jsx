export default function EmailList({ emails }) {
  if (!emails.length) {
    return <div className="text-gray-500 text-center">No emails found</div>;
  }

  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <div
          key={email.id}
          className="bg-white p-4 rounded shadow hover:bg-gray-50"
        >
          <div className="flex justify-between">
            <span className="font-medium">
              {email.subject || "(No subject)"}
            </span>
            <span className="text-sm text-gray-500">{email.date}</span>
          </div>
          <div className="text-sm text-gray-600">{email.from}</div>
          <div className="text-sm text-gray-500 mt-1">{email.snippet}</div>
        </div>
      ))}
    </div>
  );
}
