import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal",
};

export default function LegalPage() {
  return (
    <>
      <section className="lg-hero">
        <div className="lg-hero-title">
          <h1 className="anim-text-up">Legal</h1>
        </div>
      </section>

      <section className="lg-content">
        <div className="lg-container">

          {/* Terms of Service */}
          <article className="lg-section" id="terms">
            <h2 className="lg-heading">Terms of Service</h2>
            <p className="lg-updated">Last updated: April 9, 2026</p>

            <h3 className="lg-subheading">1. Acceptance of Terms</h3>
            <p className="lg-text">
              By accessing or using In Sequence (&quot;the Service&quot;), operated by In Sequence LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
            </p>

            <h3 className="lg-subheading">2. Description of Service</h3>
            <p className="lg-text">
              In Sequence is a membership platform providing educational content about deal structures, business models, and strategic frameworks for creative professionals. Content includes articles, case studies, deal structure guides, and AI-powered advisory tools.
            </p>

            <h3 className="lg-subheading">3. Accounts and Membership</h3>
            <p className="lg-text">
              You must create an account to access member content. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to create an account. You agree to provide accurate, current, and complete information during registration.
            </p>

            <h3 className="lg-subheading">4. Subscription and Billing</h3>
            <p className="lg-text">
              Paid memberships are billed on a recurring basis (monthly or annually) through Stripe. You authorize us to charge your payment method at the agreed-upon intervals. You may cancel your subscription at any time through your account settings or the Stripe customer portal. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial billing periods.
            </p>

            <h3 className="lg-subheading">5. Intellectual Property</h3>
            <p className="lg-text">
              All content on In Sequence — including text, graphics, frameworks, case studies, deal structures, and software — is owned by In Sequence LLC and protected by copyright and intellectual property laws. Your membership grants you a personal, non-exclusive, non-transferable license to access and use the content for your own professional development. You may not reproduce, distribute, sell, or publicly display any content without our written permission.
            </p>

            <h3 className="lg-subheading">6. AI-Generated Content</h3>
            <p className="lg-text">
              The Service includes AI-powered tools (Strategic Advisor, Deal Evaluator, Career Assessment) that generate personalized recommendations. AI-generated content is for informational and educational purposes only. It does not constitute legal, financial, tax, or professional advice. You should consult qualified professionals before making business or legal decisions based on any content provided by the Service.
            </p>

            <h3 className="lg-subheading">7. Acceptable Use</h3>
            <p className="lg-text">
              You agree not to: share your account credentials with others; scrape, copy, or systematically download content; use the Service for any illegal purpose; attempt to interfere with the operation of the Service; resell or redistribute member content; or use AI tools to generate content for commercial resale.
            </p>

            <h3 className="lg-subheading">8. Disclaimer of Warranties</h3>
            <p className="lg-text">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that any content will produce specific business outcomes. Educational content and AI recommendations are general in nature and may not apply to your specific situation.
            </p>

            <h3 className="lg-subheading">9. Limitation of Liability</h3>
            <p className="lg-text">
              To the maximum extent permitted by law, In Sequence LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the twelve months preceding the claim.
            </p>

            <h3 className="lg-subheading">10. Modifications</h3>
            <p className="lg-text">
              We reserve the right to modify these Terms at any time. We will notify members of material changes via email or through the Service. Continued use after changes constitutes acceptance of the updated Terms.
            </p>

            <h3 className="lg-subheading">11. Governing Law</h3>
            <p className="lg-text">
              These Terms are governed by the laws of the State of Tennessee, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Hamilton County, Tennessee.
            </p>

            <h3 className="lg-subheading">12. Contact</h3>
            <p className="lg-text">
              For questions about these Terms, contact us at <a href="mailto:hello@insequence.so">hello@insequence.so</a>.
            </p>
          </article>

          {/* Privacy Policy */}
          <article className="lg-section" id="privacy">
            <h2 className="lg-heading">Privacy Policy</h2>
            <p className="lg-updated">Last updated: April 9, 2026</p>

            <h3 className="lg-subheading">1. Information We Collect</h3>
            <p className="lg-text">
              <strong>Account information:</strong> name, email address, and password when you create an account.
              <br /><strong>Profile information:</strong> career stage, disciplines, interests, and preferences you provide.
              <br /><strong>Payment information:</strong> processed securely by Stripe. We do not store credit card numbers.
              <br /><strong>Usage data:</strong> pages visited, features used, and content interactions to improve the Service.
              <br /><strong>AI interaction data:</strong> conversations with AI tools are stored to provide personalized recommendations.
              <br /><strong>Assessment data:</strong> responses to career assessments used to generate roadmaps and recommendations.
            </p>

            <h3 className="lg-subheading">2. How We Use Your Information</h3>
            <p className="lg-text">
              We use your information to: provide and maintain the Service; personalize content recommendations; process payments and manage subscriptions; send transactional emails (welcome, payment confirmations, password resets); send newsletter communications (with your consent); generate AI-powered recommendations and assessments; improve the Service and develop new features; and comply with legal obligations.
            </p>

            <h3 className="lg-subheading">3. Information Sharing</h3>
            <p className="lg-text">
              We do not sell your personal information. We share data only with: Stripe (payment processing), Supabase (database hosting), Resend (email delivery), and Anthropic (AI processing). These providers process data in accordance with their own privacy policies and our data processing agreements.
            </p>

            <h3 className="lg-subheading">4. Data Retention</h3>
            <p className="lg-text">
              We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law. AI conversation history and assessment data are deleted with your account.
            </p>

            <h3 className="lg-subheading">5. Your Rights</h3>
            <p className="lg-text">
              You have the right to: access your personal data; correct inaccurate data; delete your account and data; export your data; opt out of marketing communications; and withdraw consent for data processing. To exercise these rights, contact us at <a href="mailto:hello@insequence.so">hello@insequence.so</a>.
            </p>

            <h3 className="lg-subheading">6. Cookies</h3>
            <p className="lg-text">
              We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. Analytics data is collected without personally identifying information.
            </p>

            <h3 className="lg-subheading">7. Security</h3>
            <p className="lg-text">
              We implement industry-standard security measures including encryption in transit (TLS), encrypted data at rest, row-level security on our database, and secure authentication via Supabase. No system is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h3 className="lg-subheading">8. Children</h3>
            <p className="lg-text">
              The Service is not intended for users under 18. We do not knowingly collect data from children. If we learn we have collected data from a child under 18, we will delete it promptly.
            </p>

            <h3 className="lg-subheading">9. Changes</h3>
            <p className="lg-text">
              We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Service.
            </p>

            <h3 className="lg-subheading">10. Contact</h3>
            <p className="lg-text">
              For privacy-related questions, contact us at <a href="mailto:hello@insequence.so">hello@insequence.so</a>.
            </p>
          </article>

          {/* Cookie Policy */}
          <article className="lg-section" id="cookies">
            <h2 className="lg-heading">Cookie Policy</h2>
            <p className="lg-updated">Last updated: April 9, 2026</p>

            <p className="lg-text">
              In Sequence uses only essential cookies required for the Service to function. These include authentication session cookies (to keep you logged in) and preference cookies (such as theme selection). We do not use advertising cookies, tracking cookies, or third-party analytics cookies. No consent banner is required because we only use strictly necessary cookies.
            </p>
          </article>

        </div>
      </section>
    </>
  );
}
