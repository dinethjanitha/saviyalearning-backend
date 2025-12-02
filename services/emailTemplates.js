// Professional email templates without emojis

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Saviya Learn</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Saviya Learn</h1>
              <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Peer-to-Peer Education Platform</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
                This is an automated message from Saviya Learn
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} Saviya Learn. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const welcomeEmail = (userName) => {
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Welcome to Saviya Learn!</h2>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">Hi ${userName},</p>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
      Thank you for joining Saviya Learn, your peer-to-peer education platform. We're excited to have you as part of our learning community!
    </p>
    <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
      <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 16px;">Getting Started:</h3>
      <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Join or create learning groups</li>
        <li>Share and discover educational resources</li>
        <li>Connect with peers and educators</li>
        <li>Participate in live learning sessions</li>
      </ul>
    </div>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
      If you have any questions or need assistance, feel free to reach out to our support team.
    </p>
    <p style="color: #475569; line-height: 1.6; margin: 24px 0 0 0;">
      Best regards,<br>
      <strong>The Saviya Learn Team</strong>
    </p>
  `;
  return baseTemplate(content);
};

export const verifyEmailTemplate = (userName, verifyUrl) => {
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">Hi ${userName},</p>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
      Thank you for registering with Saviya Learn. To complete your registration and access all features, please verify your email address.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" 
         style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); 
                color: #ffffff; 
                padding: 14px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
        Verify Email Address
      </a>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 24px 0 0 0; padding: 16px; background-color: #f8fafc; border-radius: 6px;">
      <strong>Note:</strong> If you didn't create an account with Saviya Learn, please ignore this email.
      This verification link will expire in 24 hours.
    </p>
    <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${verifyUrl}" style="color: #3b82f6; word-break: break-all;">${verifyUrl}</a>
    </p>
  `;
  return baseTemplate(content);
};

export const passwordResetEmail = (userName, resetUrl) => {
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">Hi ${userName},</p>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
      We received a request to reset your password for your Saviya Learn account. Click the button below to create a new password.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" 
         style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); 
                color: #ffffff; 
                padding: 14px 32px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
        Reset Password
      </a>
    </div>
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 6px;">
      <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
        <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>
    <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 16px 0 0 0;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
    </p>
  `;
  return baseTemplate(content);
};

export const sessionScheduledEmail = (memberName, teacherName, sessionDetails) => {
  const { title, groupInfo, scheduledDate, duration, meetingLink } = sessionDetails;
  
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">New Learning Session Scheduled</h2>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">Hi ${memberName},</p>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
      <strong>${teacherName}</strong> has scheduled a new learning session in your group.
    </p>
    
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #1e40af; margin: 0 0 16px 0; font-size: 20px;">${title}</h3>
      
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: #1e293b; font-size: 14px;">Learning Group:</strong>
          </td>
          <td style="padding: 8px 0;">
            <span style="color: #475569; font-size: 14px;">${groupInfo}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: #1e293b; font-size: 14px;">Date & Time:</strong>
          </td>
          <td style="padding: 8px 0;">
            <span style="color: #475569; font-size: 14px;">${scheduledDate}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: #1e293b; font-size: 14px;">Duration:</strong>
          </td>
          <td style="padding: 8px 0;">
            <span style="color: #475569; font-size: 14px;">${duration} minutes</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: #1e293b; font-size: 14px;">Instructor:</strong>
          </td>
          <td style="padding: 8px 0;">
            <span style="color: #475569; font-size: 14px;">${teacherName}</span>
          </td>
        </tr>
      </table>
      
      ${meetingLink ? `
        <div style="text-align: center; margin-top: 24px;">
          <a href="${meetingLink}" 
             style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                    color: #ffffff; 
                    padding: 12px 28px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block;
                    font-weight: 600;
                    font-size: 15px;
                    box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
            Join Meeting
          </a>
        </div>
      ` : ''}
    </div>
    
    <p style="color: #475569; line-height: 1.6; margin: 24px 0 0 0;">
      Don't forget to join the session at the scheduled time. We look forward to seeing you there!
    </p>
  `;
  return baseTemplate(content);
};

export const resourceSharedEmail = (memberName, uploaderName, resourceDetails) => {
  const { title, groupInfo, description, link } = resourceDetails;
  
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">New Resource Shared</h2>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">Hi ${memberName},</p>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
      <strong>${uploaderName}</strong> has shared a new educational resource with your learning group.
    </p>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="color: #78350f; margin: 0 0 16px 0; font-size: 20px;">${title}</h3>
      
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: #1e293b; font-size: 14px;">Learning Group:</strong>
          </td>
          <td style="padding: 8px 0;">
            <span style="color: #475569; font-size: 14px;">${groupInfo}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: #1e293b; font-size: 14px;">Shared By:</strong>
          </td>
          <td style="padding: 8px 0;">
            <span style="color: #475569; font-size: 14px;">${uploaderName}</span>
          </td>
        </tr>
        ${description ? `
        <tr>
          <td colspan="2" style="padding: 8px 0;">
            <strong style="color: #1e293b; font-size: 14px;">Description:</strong><br>
            <span style="color: #475569; font-size: 14px; line-height: 1.6;">${description}</span>
          </td>
        </tr>
        ` : ''}
      </table>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="${link}" 
           style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); 
                  color: #ffffff; 
                  padding: 12px 28px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  display: inline-block;
                  font-weight: 600;
                  font-size: 15px;
                  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
          View Resource
        </a>
      </div>
    </div>
    
    <p style="color: #475569; line-height: 1.6; margin: 24px 0 0 0;">
      Check out this resource to enhance your learning experience!
    </p>
  `;
  return baseTemplate(content);
};

export const sessionStartedEmail = (memberName, sessionDetails) => {
  const { title, groupInfo, teacherName, meetingLink } = sessionDetails;
  
  const content = `
    <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">Learning Session Has Started!</h2>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 16px 0;">Hi ${memberName},</p>
    <p style="color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
      The learning session "<strong>${title}</strong>" has just started. Join now to participate!
    </p>
    
    <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <h3 style="color: #14532d; margin: 0 0 16px 0; font-size: 20px;">${title}</h3>
      <p style="color: #166534; margin: 0 0 8px 0; font-size: 15px;">
        <strong>Group:</strong> ${groupInfo}
      </p>
      <p style="color: #166534; margin: 0 0 24px 0; font-size: 15px;">
        <strong>Instructor:</strong> ${teacherName}
      </p>
      
      ${meetingLink ? `
        <a href="${meetingLink}" 
           style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                  color: #ffffff; 
                  padding: 14px 32px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  display: inline-block;
                  font-weight: 600;
                  font-size: 16px;
                  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
          Join Session Now
        </a>
      ` : ''}
    </div>
    
    <p style="color: #475569; line-height: 1.6; margin: 24px 0 0 0;">
      Don't miss out on this learning opportunity. We hope to see you in the session!
    </p>
  `;
  return baseTemplate(content);
};
