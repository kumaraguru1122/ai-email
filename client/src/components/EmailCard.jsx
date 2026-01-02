import { format } from "date-fns";

const categoryColors = {
  placement: "bg-green-100 text-green-800",
  examination: "bg-blue-100 text-blue-800",
  scholarship: "bg-yellow-100 text-yellow-800",
  admin: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-800",
};

const EmailCard = ({ email  }) => {
  
  return (
    <div
      role="button"
      tabIndex={0}
      className="px-4 py-4 cursor-pointer transition-all duration-200 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-400 flex flex-col sm:flex-row sm:justify-between sm:items-center"
    >
      <div className="flex flex-col sm:flex-1 overflow-hidden">
        <span className="text-base font-semibold text-neutral-900 truncate">{email.from}</span>
        <span className="text-base text-neutral-500 mt-1 ">
          <span className="font-semibold">Summary:</span> {email.summary}
        </span>
      </div>

      <div className="flex flex-row sm:flex-col sm:items-end justify-between mt-2 sm:mt-0 gap-2 sm:gap-1">
        <span className="text-sm text-neutral-500 whitespace-nowrap">
          {format(new Date(email.date), "MMM d, yyyy HH:mm")}
        </span>
        <span
          className={`text-sm font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
            categoryColors[email.category] || "bg-gray-100 text-gray-800"
          }`}
        >
          {email.category}
        </span>
      </div>
    </div>
  );
};

export default EmailCard;
