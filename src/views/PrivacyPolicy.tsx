import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="max-w-4xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container rounded-3xl p-10 md:p-16 border border-secondary/10 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-secondary mb-2">Privacy Policy</h1>
              <p className="text-on-surface-variant font-medium">Last updated: June 8, 2026</p>
            </div>
          </div>

          <div className="space-y-10 font-serif leading-relaxed text-on-surface/90">
            <section>
              <h2 className="text-2xl font-bold text-secondary border-b border-secondary/10 pb-4 mb-6">1. Introduction</h2>
              <p>
                At Wincer Cake House ("we," "our," or "us"), we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy details how we collect, use, safeguard, and manage your information when you visit our website, place an order, or engage with our custom cake services. 
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary border-b border-secondary/10 pb-4 mb-6">2. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong className="text-on-surface">Personal Information:</strong> Contact details such as your name, email address, phone number, and delivery address required to process and deliver your custom cake orders.</li>
                <li><strong className="text-on-surface">Order Details:</strong> Information related to your events (e.g., event dates, occasions, design inspirations, dietary restrictions, and allergies).</li>
                <li><strong className="text-on-surface">Account Information:</strong> If you create an account, we may store your saved items, design concepts, and order history.</li>
                <li><strong className="text-on-surface">Usage Data:</strong> Basic analytics such as browser type, pages visited, and interaction with our website to help us improve the browsing experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary border-b border-secondary/10 pb-4 mb-6">3. How We Use Your Information</h2>
              <p className="mb-4">We rely on your data strictly to provide you with the best possible service:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>To process, fulfill, and coordinate the delivery of your bespoke cakes.</li>
                <li>To communicate with you regarding your order status, design consultations, or account updates.</li>
                <li>To improve our catalog, customizer tools, and website performance.</li>
                <li>To comply with legal obligations and ensure the safety of our customers and business.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary border-b border-secondary/10 pb-4 mb-6">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Payment processing is handled by secure third-party gateways, and we do not store your full financial details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary border-b border-secondary/10 pb-4 mb-6">5. Third-Party Sharing</h2>
              <p>
                Wincer Cake House will never sell, rent, or trade your personal information to third parties. We only share necessary data with trusted service providers who assist us in operating our website, conducting our business (such as delivery couriers and payment processors), provided they agree to keep this information confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary border-b border-secondary/10 pb-4 mb-6">6. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any time. If you wish to manage your data, simply log into your account or contact our support team. Depending on your location, you may also have the right to request a copy of the data we hold about you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-secondary border-b border-secondary/10 pb-4 mb-6">7. Contact Us</h2>
              <p className="mb-4">
                If you have any questions or concerns regarding this Privacy Policy or our data practices, please reach out to us:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Email:</strong> privacy@wincercakehouse.com</li>
                <li><strong>Phone / WhatsApp:</strong> +254 722 632 717</li>
                <li><strong>Location:</strong> Nairobi, Kenya</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
