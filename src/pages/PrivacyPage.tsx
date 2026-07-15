import { LegalPage } from './LegalPage';

const sections = [
  { heading: '1. Information We Collect', body: ['We collect information you provide directly — name, email, phone number, and address when you create an account or book a service.', 'We also collect usage data such as pages visited, services searched, and device information to improve your experience.'] },
  { heading: '2. How We Use Your Information', body: ['To provide and manage your bookings, assign professionals, and process payments.', 'To send booking confirmations, service updates, and promotional offers (you can opt out anytime).', 'To maintain safety and quality through reviews and verification.'] },
  { heading: '3. Information Sharing', body: ['We share your name, address, and contact details with the assigned professional solely to deliver the service.', 'We never sell your personal data to third parties. Service providers (payment processors) receive only what is needed to process transactions.'] },
  { heading: '4. Data Security', body: ['We use industry-standard encryption (TLS) for data in transit and at rest. Payment data is tokenized and never stored on our servers.'] },
  { heading: '5. Your Rights', body: ['You can access, correct, or delete your personal data from your dashboard or by contacting us. You may opt out of marketing communications at any time.'] },
  { heading: '6. Cookies', body: ['We use cookies and similar technologies to remember preferences, analyze traffic, and personalize content. You can control cookies in your browser settings.'] },
  { heading: '7. Children\u2019s Privacy', body: ['Our services are not directed to children under 18. We do not knowingly collect data from minors.'] },
  { heading: '8. Changes to This Policy', body: ['We may update this policy from time to time. We will notify you of significant changes via email or in-app notification.'] },
];

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="January 2025"
      intro="Your privacy is important to us. This policy explains what data we collect, how we use it, and the choices you have."
      sections={sections}
    />
  );
}
