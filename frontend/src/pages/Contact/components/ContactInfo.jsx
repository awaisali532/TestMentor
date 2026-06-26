import React from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import Reveal from "../../../components/ui/Reveal";

const ContactInfo = ({ info }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Email Card */}
      <Reveal direction="left" delay={100}>
        <div className="group bg-card/50 backdrop-blur-md border border-border p-6 rounded-2xl flex items-start gap-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-1/50 hover:shadow-xl hover:shadow-accent-1/10">
          <div className="shrink-0 size-14 bg-pill-bg text-accent-1 rounded-xl flex items-center justify-center text-2xl transition-colors duration-300 group-hover:bg-accent-1 group-hover:text-white">
            <FaEnvelope />
          </div>
          <div>
            <h5 className="text-lg font-bold text-main mb-1">Chat to us</h5>
            <p className="text-muted text-sm mb-2">
              Our friendly team is here to help.
            </p>
            <a
              href={`mailto:${info.email}`}
              className="font-semibold text-accent-1 hover:text-accent-2 hover:underline transition-colors"
            >
              {info.email}
            </a>
          </div>
        </div>
      </Reveal>

      {/* Address Card */}
      <Reveal direction="left" delay={200}>
        <div className="group bg-card/50 backdrop-blur-md border border-border p-6 rounded-2xl flex items-start gap-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-1/50 hover:shadow-xl hover:shadow-accent-1/10">
          <div className="shrink-0 size-14 bg-pill-bg text-accent-1 rounded-xl flex items-center justify-center text-2xl transition-colors duration-300 group-hover:bg-accent-1 group-hover:text-white">
            <FaMapMarkerAlt />
          </div>
          <div>
            <h5 className="text-lg font-bold text-main mb-1">Visit us</h5>
            <p className="text-muted text-sm mb-2">
              Come say hello at our office HQ.
            </p>
            <span className="font-semibold text-main">{info.address}</span>
          </div>
        </div>
      </Reveal>

      {/* Phone Card */}
      <Reveal direction="left" delay={300}>
        <div className="group bg-card/50 backdrop-blur-md border border-border p-6 rounded-2xl flex items-start gap-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-1/50 hover:shadow-xl hover:shadow-accent-1/10">
          <div className="shrink-0 size-14 bg-pill-bg text-accent-1 rounded-xl flex items-center justify-center text-2xl transition-colors duration-300 group-hover:bg-accent-1 group-hover:text-white">
            <FaPhoneAlt />
          </div>
          <div>
            <h5 className="text-lg font-bold text-main mb-1">Call us</h5>
            <p className="text-muted text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
            <a
              href={`tel:${info.phone}`}
              className="font-semibold text-accent-1 hover:text-accent-2 hover:underline transition-colors"
            >
              {info.phone}
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default ContactInfo;
