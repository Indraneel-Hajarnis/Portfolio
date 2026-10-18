// ============================================================
// CONTACT FORM SETTINGS — fill these in to start receiving messages
//
// The form sends the message through EmailJS (free plan), which
// delivers it to your Gmail inbox. One-time setup:
//
//  1. Sign up at https://www.emailjs.com
//  2. Email Services → Add New Service → Gmail → connect the Gmail
//     account that should RECEIVE the messages. Copy its Service ID.
//  3. Email Templates → Create New Template, and set:
//        To Email:   {{to_email}}   (or type your Gmail address here)
//        From Name:  {{from_name}}
//        Reply To:   {{reply_to}}
//        Subject:    {{subject}}
//        Content:    Name: {{from_name}}
//                    Email: {{from_email}}
//                    Service: {{service}}
//
//                    {{message}}
//     Copy the Template ID.
//  4. Account → General → copy your Public Key.
//  5. Account → Security → restrict the key to your website's domain.
//
// Note: Gmail does not allow sending "as" another person's address, so the
// mail arrives from your connected Gmail account with the visitor's name in
// "From Name" and their email in "Reply To" — pressing Reply in Gmail
// answers the visitor directly.
// ============================================================
window.CONTACT_CONFIG = {
  serviceId: 'service_3t106ce',  // e.g. 'service_abc123'
  templateId: 'template_b2ezlpv', // e.g. 'template_xyz789'
  publicKey: 't9idV3beTZcomJsHG',  // e.g. 'AbCdEf123456'
  toEmail: ''     // Gmail address that receives the messages (can stay '' if it is set in the template)
};
