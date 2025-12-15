import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send an email using SMTP.
    Returns True if successful, False otherwise.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EMAIL MOCK] SMTP not configured. Would send to: {to_email}")
        print(f"[EMAIL MOCK] Subject: {subject}")
        print(f"[EMAIL MOCK] Content preview: {html_content[:200]}...")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL or settings.SMTP_USER}>"
        msg['To'] = to_email
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Connect and send
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(
                settings.SMTP_USER,
                to_email,
                msg.as_string()
            )
        
        print(f"[EMAIL] Successfully sent email to {to_email}")
        return True
        
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {str(e)}")
        return False


async def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send a password reset email with a reset link.
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center;">
                                <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 12px; line-height: 60px; font-size: 28px; font-weight: bold; color: white;">
                                    T
                                </div>
                                <h1 style="margin: 20px 0 0; color: #111827; font-size: 24px; font-weight: 700;">
                                    Reset Your Password
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 20px 40px;">
                                <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    We received a request to reset your password for your TrustAI account. Click the button below to set a new password:
                                </p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="{reset_link}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 14px -1px rgba(79, 70, 229, 0.4);">
                                        Reset Password
                                    </a>
                                </div>
                                
                                <p style="margin: 20px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                    This link will expire in <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
                                </p>
                                
                                <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                                    If the button doesn't work, copy and paste this link into your browser:<br>
                                    <a href="{reset_link}" style="color: #4F46E5; word-break: break-all;">{reset_link}</a>
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px 40px; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                    © 2024 TrustAI. All rights reserved.<br>
                                    This is an automated message, please do not reply.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    return await send_email(to_email, "Reset Your Password - TrustAI", html_content)
