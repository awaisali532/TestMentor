import React, { useRef } from "react";

const OtpBox = ({ otp, setOtp, onComplete }) => {
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Agar value type ki hai aur agla box mojood hai, toh focus wahan shift karo
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace dabane par pichle box mein wapis jana
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Sirf numbers allow hain

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Paste hone ke baad aakhri bhare hue box par focus set karo
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center mb-8">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          ref={(el) => (inputRefs.current[index] = el)}
          autoFocus={index === 0}
          className="w-10 sm:w-12 h-12 sm:h-14 rounded-xl border-2 border-border bg-bg-body text-main text-xl font-bold text-center outline-none focus:border-accent-1 focus:ring-4 focus:ring-accent-1/15 transition-all duration-200"
        />
      ))}
    </div>
  );
};

export default OtpBox;
