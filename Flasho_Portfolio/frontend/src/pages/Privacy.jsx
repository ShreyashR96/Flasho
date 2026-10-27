import { useLayoutEffect } from 'react';
import useSEO from '../hooks/useSEO';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  useSEO({
    title: 'Privacy Policy | Flasho',
    description: 'Read the Privacy Policy for Flasho Home Services.'
  });

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "June 15, 2026";

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative border-b border-gray-100 bg-white overflow-hidden">
        {/* Abstract background subtle glow */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex items-center gap-3 text-sm font-medium mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-gray-600 border border-gray-200 shadow-sm">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900">Legal</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <span className="text-primary tracking-widest uppercase text-[11px] font-bold">Privacy Policy</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 tracking-tight">
            Privacy Policy<span className="text-primary">.</span>
          </h1>
          
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm font-medium bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
            <Calendar size={16} className="text-primary" />
            <span>Effective Date: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-body text-[15px] sm:text-base">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. INTRODUCTION</h2>
          <p className="mb-4">Welcome to Flasho. This document outlines the comprehensive Privacy Policy for Flasho Technologies, encompassing our website, mobile applications, and all associated digital services, collectively referred to as the Platform. Flasho, representing the company, its affiliates, and authorized operators, is deeply committed to safeguarding the privacy, confidentiality, and security of the personal information entrusted to us by our users, customers, partner agencies, and website visitors. This Privacy Policy is designed to provide full transparency regarding our data governance practices. It meticulously details how we collect, utilize, store, process, and protect your information when you interact with our Platform. By accessing, downloading, registering on, or utilizing any services offered through Flasho, you formally acknowledge that you have thoroughly read, completely understood, and unequivocally agreed to the stipulations set forth in this Privacy Policy.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. CORPORATE NATURE AND SCOPE</h2>
          <p className="mb-4">Flasho operates exclusively as a highly integrated technology platform and digital intermediary. Our primary function is to seamlessly connect prospective customers with rigorously verified independent service agencies specializing in home, office, maintenance, repair, and various other professional services. It is important to clarify that Flasho acts solely as a service marketplace and technological facilitator. We do not directly employ, manage, or supervise the service personnel deployed by these independent agencies unless expressly stated otherwise in specific contractual agreements.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. CATEGORIES OF INFORMATION WE COLLECT</h2>
          <p className="mb-4">To provide a highly tailored and efficient service experience, we systematically collect various categories of information. Firstly, we gather Personal Information, which includes your full legal name, active mobile telephone number, primary email address, optional profile photographs, and exact residential or service delivery addresses. Secondly, we collect Account Information necessary for platform access, which encompasses your secure login credentials, customizable user preferences, saved multiple addresses for recurring services, and a comprehensive log of your booking history.</p>
          <p className="mb-4">Furthermore, we process Transaction Information, detailing the specifics of your bookings, chronological service history, secure payment routing data, formal invoice records, and any documentation related to refunds or dispute resolutions. We also automatically capture Device Information to optimize platform performance. This includes logging your IP address, browser type and version, specific device models, operating system architecture, and unique device identifiers. Finally, subject to your explicit consent, Flasho may collect precise Location Information utilizing GPS and cellular network telemetry to accurately identify operable service areas, significantly improve our algorithmic service matching, and provide localized offerings tailored to your immediate geographic vicinity.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. METHODOLOGIES OF DATA COLLECTION</h2>
          <p className="mb-4">Our data collection protocols are multifaceted to ensure platform efficacy. We collect information directly from you during your active engagements with the Platform, such as when you initially register for a user account, initiate a service booking, contact our dedicated support teams, submit digital forms, or opt-in to our promotional updates. Additionally, we employ automated data collection mechanisms that continuously operate in the background while you navigate the Platform. These automated tools utilize tracking cookies, advanced analytics software, server-side website logs, and mobile application telemetry data to understand user behavior. We also receive supplementary information from trusted Third Parties, strictly limiting this to verified payment gateway processors, officially onboarded partner agencies, independent identity verification providers, and integrated customer support management systems.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. UTILIZATION OF COLLECTED INFORMATION</h2>
          <p className="mb-4">The information we collect is strictly utilized for predetermined, legitimate business purposes. Primarily, your data is essential for Service Delivery, allowing us to accurately process service bookings, optimally assign the most suitable service providers, and efficiently manage ongoing customer requests. We also leverage this information for Customer Support operations, utilizing your historical data to rapidly resolve ongoing issues, respond to complex inquiries, and systematically improve our overall service quality based on user feedback.</p>
          <p className="mb-4">Platform Operations heavily rely on your data to maintain stringent cybersecurity protocols, detect and prevent fraudulent activities, and dynamically monitor platform performance metrics. We utilize your contact details for Communication purposes, sending critical booking confirmations, real-time service arrival updates, transactional alerts, and important platform-wide administrative announcements. Lastly, we process your information to ensure strict Legal Compliance, fulfilling our statutory tax reporting requirements, responding to lawful government subpoenas, and adhering to all overarching legal obligations mandated by the governing jurisdictions.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. INFORMATION SHARING AND DISCLOSURE</h2>
          <p className="mb-4">Flasho maintains a strict corporate policy against the monetization or sale of your personal information to unverified third parties. We strictly limit the sharing of your data to entities directly involved in the service fulfillment lifecycle. We share absolutely necessary information with our Partner Agencies, restricting the disclosed data to your name, contact number, exact service address, and specific booking requirements to ensure the successful execution of the requested task.</p>
          <p className="mb-4">We transmit encrypted financial data to our approved Payment Service Providers solely to securely authorize and process your financial transactions. Furthermore, we collaborate with specialized Technology Service Providers who assist us with secure cloud hosting, user analytics, customer support ticketing, and advanced cybersecurity monitoring. In highly specific scenarios, we may be compelled to disclose your information to recognized Government Authorities or law enforcement agencies, but only when strictly required by enforceable legal statutes, court orders, or formal regulatory mandates.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. COOKIES AND TRACKING TECHNOLOGIES</h2>
          <p className="mb-4">The Flasho digital ecosystem extensively utilizes cookies, web beacons, and similar tracking technologies to fundamentally improve your user experience. These small data files allow our systems to remember your localized preferences, conduct comprehensive analyses of website traffic patterns, and continuously enhance our cybersecurity posture by identifying anomalous behavioral patterns. While users retain the absolute right to disable or restrict cookie usage through their respective web browser settings, please be advised that doing so may inadvertently disable essential platform features and negatively impact your overall navigational experience.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. DATA SECURITY MEASURES</h2>
          <p className="mb-4">We implement highly robust, industry-standard technical and organizational measures to relentlessly protect your personal information against unauthorized access, accidental loss, or malicious alteration. Our security architecture includes end-to-end encrypted communication protocols, secured cloud servers housed in highly monitored facilities, strict internal access controls based on the principle of least privilege, multi-factor authentication systems for administrative access, and continuous, automated security vulnerability monitoring. Nevertheless, while we strive to utilize commercially acceptable means to protect your data, you must acknowledge that no method of data transmission over the public internet or electronic storage can ever be guaranteed as entirely infallible or completely secure.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. DATA RETENTION FRAMEWORK</h2>
          <p className="mb-4">Flasho fundamentally adheres to a principle of data minimization, retaining your personal information only for the duration strictly necessary to fulfill the operational purposes outlined within this Privacy Policy. We maintain your data to continuously provide uninterrupted services, resolve ongoing or historical user disputes, legally enforce our contractual agreements, and meet stringent legal obligations. Certain critical transactional records, financial invoices, and taxation data may be retained for extended statutory periods as strictly required by applicable corporate and financial laws within the jurisdiction of India.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. USER RIGHTS AND DATA CONTROL</h2>
          <p className="mb-4">We deeply respect your autonomy over your personal data. Consequently, you possess the right to formally request access to view the specific personal information comprehensively associated with your registered account. You may request the immediate update or rectification of any inaccurate, incomplete, or outdated information. Furthermore, you hold the right to request the complete deletion of your account and its associated personal data, strictly subject to our mandatory legal retention requirements and ongoing dispute resolutions. You also reserve the right to explicitly withdraw any specific data processing permissions or consents previously granted to us. All such data privacy requests must be formally submitted through our designated customer support channels for secure verification and timely processing.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. MARKETING AND PROMOTIONAL COMMUNICATIONS</h2>
          <p className="mb-4">Registered users may periodically receive digital communications from us concerning localized service notifications, comprehensive platform updates, exclusive promotional offers, and general marketing materials. We respect your communication preferences, and users may explicitly unsubscribe from receiving these promotional communications at any time by utilizing the designated opt-out links embedded within the emails or by adjusting their account notification settings. Please note that even if you opt out of marketing materials, Flasho will still transmit mandatory transactional emails, booking receipts, and critical service-related notifications necessary for platform functionality.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. PROTECTION OF MINORS</h2>
          <p className="mb-4">The Flasho platform and its associated services are strictly intended for utilization by individuals who have attained the legal age of majority, which is eighteen years of age or older. We do not intentionally or knowingly collect, solicit, or process personal information from unsupervised minors. If our administrative teams become aware that we have inadvertently collected personal data from an individual under the legally required age without verified parental consent, we will take immediate and decisive steps to permanently purge such information from our active databases in strict compliance with applicable child protection laws.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. THIRD-PARTY DOMAINS AND EXTERNAL LINKS</h2>
          <p className="mb-4">For your convenience and informational purposes, the Flasho platform may occasionally contain hyperlinks redirecting you to independent third-party websites, applications, and external digital services. Flasho firmly disclaims any responsibility for the privacy practices, data collection protocols, or informational content present on these external domains. We strongly encourage all users to exercise due diligence and carefully review the distinct privacy policies of those third-party entities before submitting any personal information outside the Flasho ecosystem.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">14. CORPORATE RESTRUCTURING AND BUSINESS TRANSFERS</h2>
          <p className="mb-4">In the event that Flasho undergoes a significant corporate transition—such as a structural merger, acquisition by another corporate entity, major investment transaction, comprehensive business restructuring, or the strategic sale of all or a portion of our corporate assets—your user information will likely be considered a transferable business asset. In such scenarios, your data may be securely transferred to the acquiring entity or new management structure, strictly subject to the continuous protections outlined in this Privacy Policy and all applicable regional data protection laws.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">15. MODIFICATIONS TO THIS POLICY</h2>
          <p className="mb-4">Given the dynamic nature of digital privacy regulations and our evolving technological capabilities, Flasho reserves the unilateral right to routinely update, amend, or completely revise this Privacy Policy at any time. All updated versions will be promptly published directly on our website and integrated mobile applications, accompanied by a revised "Last Updated" timestamp at the top of the document. Your continued access to or utilization of the Flasho platform following the public posting of any such updates constitutes your binding legal acceptance of the newly revised Privacy Policy terms.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">16. CONTACT INFORMATION</h2>
          <p className="mb-4">For any formal inquiries, specific data requests, or general concerns strictly relating to this Privacy Policy or your personal data, we encourage you to contact our corporate headquarters. You may reach Flasho via email at <a href="mailto:hello@flasho.services" className="text-primary hover:underline">hello@flasho.services</a> or by telephone/WhatsApp at <a href="tel:+919561850928" className="text-primary hover:underline">+91 9561850928</a>. Our physical corporate location is registered in Kolhapur, Maharashtra, India.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">17. DESIGNATED GRIEVANCE OFFICER</h2>
          <p className="mb-4">In strict accordance with the Information Technology Act, 2000, and the applicable rules mandated by Indian law, users maintain the right to escalate serious privacy concerns to our formally designated regulatory representative. You may direct your formal grievances to our Grievance Officer via email at <a href="mailto:privacy@flasho.services" className="text-primary hover:underline">privacy@flasho.services</a>. Our office is legally committed to addressing and attempting to resolve all legitimate privacy-related disputes within the reasonable timelines strictly mandated under the applicable regulatory framework.</p>

        </div>
      </div>
    </div>
  );
}
