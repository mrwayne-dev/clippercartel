<?php
/**
 * Project: clippercartel
 * Author:  wayne
 * Created: 2026-10-04
 */

class EmailTemplates {

    private static function layout(string $title, string $body): string {
        $appName = getenv('APP_NAME') ?: 'clippercartel';
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"><title>$title</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header  { background: #3b82f6; color: #fff; padding: 24px 32px; }
    .content { padding: 32px; color: #1f2937; line-height: 1.7; }
    .footer  { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #6b7280; }
    .btn     { display: inline-block; margin-top: 16px; padding: 12px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h2>$appName</h2></div>
    <div class="content">$body</div>
    <div class="footer">&copy; {$appName}. All rights reserved.</div>
  </div>
</body>
</html>
HTML;
    }

    public static function welcome(string $name): string {
        $body = "<h3>Welcome, $name!</h3><p>Your account has been created successfully.</p>";
        return self::layout('Welcome', $body);
    }

    public static function passwordReset(string $name, string $resetLink): string {
        $body = "<h3>Password Reset</h3>"
              . "<p>Hi $name, click below to reset your password (expires in 1 hour).</p>"
              . "<a class='btn' href='$resetLink'>Reset Password</a>"
              . "<p style='margin-top:16px;font-size:12px;color:#6b7280;'>Didn't request this? Ignore this email.</p>";
        return self::layout('Password Reset', $body);
    }
}
