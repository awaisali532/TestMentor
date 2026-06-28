import React from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";

const RecentActivityTable = ({ loading, papers }) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-extrabold text-main">Recent Activity</h4>
        <Link
          to="/user/saved-papers"
          className="text-sm font-bold text-accent-1 hover:text-accent-2 px-4 py-1.5 rounded-full border border-accent-1/30 hover:bg-accent-1/10 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-muted animate-pulse">
            Loading recent activity...
          </div>
        ) : papers.length === 0 ? (
          <div className="p-12 text-center text-muted border-2 border-dashed border-border rounded-xl m-4">
            No papers generated yet. Start by creating one!
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-150">
            <thead>
              <tr className="bg-pill-bg text-muted text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Title</th>
                <th className="p-4 font-bold">Subject</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {papers.map((paper) => (
                <tr
                  key={paper._id}
                  className="hover:bg-pill-bg/50 transition-colors"
                >
                  <td className="p-4 font-bold text-main">{paper.title}</td>
                  <td className="p-4">
                    <span className="bg-pill-bg border border-border text-main px-3 py-1 rounded-md text-xs font-semibold">
                      {paper.subject}
                    </span>
                  </td>
                  <td className="p-4 text-main font-medium">{paper.grade}</td>
                  <td className="p-4 text-muted text-sm">
                    {new Date(paper.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to="/user/saved-papers"
                      state={{ highlight: paper._id }}
                      className="inline-flex items-center justify-center p-2 text-muted hover:text-accent-1 hover:bg-accent-1/10 rounded-full transition-colors"
                      title="View"
                    >
                      <FaEye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentActivityTable;
