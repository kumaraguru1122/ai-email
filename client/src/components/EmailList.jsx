import React from "react";
import EmailCard from "../components/EmailCard";

const EmailList = ({ emails }) => {
  return (
    <div className="divide-y divide-neutral-200">
      {emails.map((email) => (
        <EmailCard key={email.id} email={email} />
      ))}
    </div>
  );
};

export default EmailList;
