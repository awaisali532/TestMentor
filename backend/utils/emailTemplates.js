// utils/emailTemplates.js

// --- GREEN TEMPLATE (Verification) ---
const generateVerificationTemplate = (name, otp) => {
  return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #3ca8a0; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px;">TestMentor Security</h2>
        </div>
        
        <div style="padding: 30px; color: #333333;">
          <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5;">
            You requested to verify your account. Please use the OTP below to complete the process.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3ca8a0; background-color: #f0fdfc; padding: 15px 30px; border-radius: 8px; border: 2px dashed #3ca8a0;">
              ${otp}
            </span>
          </div>
  
          <p style="font-size: 14px; color: #666;">
            This code is valid for <strong>10 minutes</strong>. <br/>
            If you did not request this, please ignore this email.
          </p>
        </div>
  
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} TestMentor. All rights reserved.
        </div>
      </div>
    `;
};

// --- RED TEMPLATE (Password Reset) ---
const generateResetTemplate = (name, otp) => {
  return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #dc3545; padding: 20px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset</h2>
        </div>
        
        <div style="padding: 30px; color: #333333;">
          <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5;">
            We received a request to reset your password. Use the OTP below to set a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc3545; background-color: #fff5f5; padding: 15px 30px; border-radius: 8px; border: 2px dashed #dc3545;">
              ${otp}
            </span>
          </div>
  
          <p style="font-size: 14px; color: #666;">
            This code is valid for <strong>10 minutes</strong>. <br/>
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
  
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} TestMentor. All rights reserved.
        </div>
      </div>
    `;
};

module.exports = { generateVerificationTemplate, generateResetTemplate };
