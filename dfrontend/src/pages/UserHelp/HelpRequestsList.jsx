import { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Navigation from "../../components/Navigation";
import { useUsername } from "../../context/UsernameContext";
import { useHelp } from "../../context/HelpsContext";
import { Link } from "react-router-dom";

export default function HelpRequestsList() {
  const username = useUsername();
  const [helps, setHelps] = useState([]);
  const { helpsbycontext } = useHelp();

  const gradients = [
    "linear-gradient(135deg, rgba(249,115,22,0.4), rgba(219,39,119,0.4))", // orange-pink
    "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(147,51,234,0.4))", // blue-purple
    "linear-gradient(135deg, rgba(5,150,105,0.4), rgba(34,197,94,0.4))",   // green
    "linear-gradient(135deg, rgba(14,165,233,0.4), rgba(59,130,246,0.4))"  // cyan-blue
  ];

  useEffect(() => {
    if (helpsbycontext) {
      setHelps(helpsbycontext);
    }
  }, [helpsbycontext]);

  return (
    <>
      <Navigation />
      <div
        className="min-h-screen bg-fixed bg-cover bg-center bg-no-repeat bg-blend-hard-light"
        style={{ backgroundImage: `url('purplelinebg2.png')` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center text-purple-800 mb-10 drop-shadow-lg">
            Help Requests
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-[100%] mx-auto">
            {helps.filter(help => help.approve !== false).length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center text-gray-500">
                <p>No help requests available at the moment.</p>
              </div>
            )}
            {helps.map((help, index) => {
              if (help.approve === false) {
                return null;
              }
              const gradient = gradients[index % gradients.length];
              return (
                <div
                  key={help.id || index}
                  className="relative h-[280px] rounded-xl overflow-hidden shadow-xl group bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${help.image1 || "/placeholder.svg"})`
                  }}
                >
                  {/* Gradient Overlay */}
                  <div
                    className="absolute inset-0 transition-all duration-300 group-hover:opacity-80"
                    style={{ background: gradient }}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                    <div>
                      <h3 className="text-xl font-bold">{help.requester_name}</h3>
                      <p className="text-sm text-slate-200 mt-2">
                        <span className="font-medium text-slate-300">Approved Date:</span> {help.verification_date}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-green-300 text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Approved By: {help.verified_by || "N/A"}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          {help.help_type}
                        </span>
                        <Link
                          to={`/help-request/${help.id}`}
                          className="bg-white text-purple-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-100 transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
