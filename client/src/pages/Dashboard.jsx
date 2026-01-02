import TopBar from "../components/TopBar";
import SideBar from "../components/SideBar";
import EmailList from "../components/EmailList";
import EmailContent from "../components/EmailContent";

import emailData from "../data/emails.json";

const Dashboard = () => {

  // temporary data for design purpose
  const emails = emailData;
  const showList = true;

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <TopBar />

      <main className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <SideBar />
        </div>

        <section className="flex-1 overflow-y-auto bg-white">
          {showList ? (
            <EmailList emails={emails} />
          ) : (
            <EmailContent email={emails[0]} />
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
