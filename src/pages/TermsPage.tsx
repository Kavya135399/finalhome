import { LegalPage } from './LegalPage';

const sections = [
  { heading: '1. Acceptance of Terms', body: ['By accessing or using HomeSeva, you agree to be bound by these Terms. If you do not agree, please do not use our services.'] },
  { heading: '2. Account Registration', body: ['You must provide accurate and complete information when creating an account. You are responsible for safeguarding your password and for all activity under your account.'] },
  { heading: '3. Booking & Services', body: ['Bookings are subject to professional availability. Service prices are displayed upfront and include all taxes unless stated otherwise.', 'You agree to be present at the scheduled time and provide a safe working environment for the professional.'] },
  { heading: '4. Payments', body: ['Payments can be made via UPI, card, or cash on service. Online payments are processed securely through our payment partners.', 'Invoices are available for download from your dashboard after service completion.'] },
  { heading: '5. Cancellations & Refunds', body: ['Free cancellation is available up to 2 hours before the scheduled slot. Same-day cancellations may incur a nominal fee.', 'Refunds for prepaid bookings are processed to the original payment method within 5-7 business days.'] },
  { heading: '6. Service Warranty', body: ['Most services carry a 30-90 day warranty. If the issue recurs within the warranty period, we will re-service at no additional cost.'] },
  { heading: '7. User Conduct', body: ['You agree not to abuse, harass, or discriminate against professionals. Violations may result in account suspension.'] },
  { heading: '8. Liability', body: ['HomeSeva acts as a platform connecting customers with professionals. We are not liable for damages beyond the service fee paid, except where prohibited by law.'] },
  { heading: '9. Modifications', body: ['We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance.'] },
  { heading: '10. Governing Law', body: ['These Terms are governed by the laws of India. Disputes will be subject to the exclusive jurisdiction of courts in Mumbai.'] },
];

export function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      lastUpdated="January 2025"
      intro="These terms govern your use of HomeSeva. Please read them carefully before using our platform."
      sections={sections}
    />
  );
}
