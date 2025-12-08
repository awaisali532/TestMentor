import React from "react";
import { FaHistory, FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";

const RecentActivity = () => {
  // Dummy Data Grouped by Days
  const activities = [
    {
      day: "Today",
      events: [
        {
          time: "10:30 AM",
          action: "Added 5 MCQs to Physics (9th)",
          user: "Admin",
        },
        {
          time: "09:15 AM",
          action: "Updated Chapter 2 of Math",
          user: "Admin",
        },
      ],
    },
    {
      day: "Yesterday",
      events: [
        {
          time: "04:00 PM",
          action: "Deleted incorrect question in English",
          user: "Admin",
        },
        {
          time: "02:20 PM",
          action: "Created new subject: Computer Science",
          user: "Admin",
        },
        {
          time: "11:00 AM",
          action: "Added 10 Short Questions to Urdu",
          user: "Admin",
        },
      ],
    },
    {
      day: "2 Days Ago",
      events: [
        {
          time: "05:45 PM",
          action: "Registered new Teacher: Sir Ali",
          user: "System",
        },
        {
          time: "01:30 PM",
          action: "Bulk Uploaded 50 MCQs to Chemistry",
          user: "Admin",
        },
      ],
    },
  ];

  return (
    <div className="w-100">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 p-2 rounded me-3 text-primary">
          <FaHistory size={24} />
        </div>
        <h3 className="fw-bold text-dark m-0">Recent Activity Log</h3>
      </div>

      <div className="row">
        <div className="col-12">
          {/* Timeline Container */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            {activities.map((group, index) => (
              <div key={index} className="mb-4">
                {/* Date Header */}
                <h6 className="fw-bold text-secondary text-uppercase small mb-3 border-bottom pb-2">
                  {group.day}
                </h6>

                {/* Activity Items */}
                <div className="activity-list">
                  {group.events.map((event, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-start mb-3 p-3 rounded-3"
                      style={{ backgroundColor: "#F9FAFB" }}
                    >
                      {/* Icon */}
                      <div className="me-3 mt-1 text-success">
                        <FaCheckCircle />
                      </div>

                      {/* Content */}
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-semibold text-dark">
                          {event.action}
                        </p>
                        <small className="text-muted">
                          <span className="fw-bold text-secondary">
                            {event.user}
                          </span>{" "}
                          • {event.time}
                        </small>
                      </div>

                      {/* Optional Actions */}
                      <div className="text-end">
                        <button className="btn btn-sm btn-light text-primary me-2">
                          <FaEdit />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Load More */}
            <div className="text-center mt-3">
              <button className="btn btn-outline-primary btn-sm rounded-pill px-4">
                Load Older Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
