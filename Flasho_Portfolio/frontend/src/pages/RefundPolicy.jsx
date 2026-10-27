import { useLayoutEffect } from 'react';
import useSEO from '../hooks/useSEO';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  useSEO({
    title: 'Refund Policy | Flasho',
    description: 'Read the Refund Policy for Flasho Home Services.'
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
            <span className="text-primary tracking-widest uppercase text-[11px] font-bold">Cancellation & Refund Policy</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-gray-900 mb-6 tracking-tight">
            Refund & Cancellation Policy<span className="text-primary">.</span>
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
          <p className="mb-4">This Refund and Cancellation Policy ("Policy") governs cancellations, refunds, and related matters for services booked through Flasho.</p>
          <p className="mb-4">By booking a service through Flasho, you agree to the terms outlined in this Policy.</p>
          <p className="mb-6">Flasho operates as a technology platform connecting customers with registered service agencies and professionals. Refunds and cancellations are processed in accordance with this Policy and applicable laws.</p>
          
          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. SERVICE CANCELLATION BY CUSTOMER</h2>
          
          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">2.1 Cancellation Before Agency Acceptance</h3>
          <p className="mb-2">If a customer cancels a booking before it has been accepted by a partner agency:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>No cancellation fee will be charged.</li>
            <li>Any payment made will be refunded in full.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">2.2 Cancellation After Agency Acceptance</h3>
          <p className="mb-2">If a customer cancels after the booking has been accepted by an agency:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>A cancellation fee may be charged.</li>
            <li>The amount may vary depending on:
              <ul className="list-[circle] pl-6 mt-2 space-y-1">
                <li>Service category</li>
                <li>Booking value</li>
                <li>Time of cancellation</li>
                <li>Resources allocated</li>
              </ul>
            </li>
          </ul>
          <p className="mb-6">The remaining balance, if any, will be refunded.</p>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">2.3 Cancellation After Service Personnel Dispatch</h3>
          <p className="mb-2">If service personnel have already been assigned and dispatched:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Travel and operational charges may be deducted.</li>
            <li>Partial refunds may apply.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">2.4 Cancellation After Service Commencement</h3>
          <p className="mb-2">Once service work has started:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>No cancellation request shall be eligible for a refund.</li>
            <li>Charges for completed work remain payable.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. CANCELLATION BY FLASHO OR AGENCY</h2>
          <p className="mb-2">A booking may be cancelled by Flasho or the partner agency due to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Unavailability of service personnel</li>
            <li>Safety concerns</li>
            <li>Incorrect booking information</li>
            <li>Service area restrictions</li>
            <li>Technical issues</li>
            <li>Force majeure events</li>
          </ul>
          <p className="mb-6">In such cases, customers shall receive a full refund for prepaid amounts.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. REFUND ELIGIBILITY</h2>
          <p className="mb-6">Refunds may be considered under the following circumstances:</p>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">4.1 Duplicate Payment</h3>
          <p className="mb-2">If a customer is charged multiple times for the same booking:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>The excess amount shall be refunded.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">4.2 Failed Transaction</h3>
          <p className="mb-2">If payment is deducted but the booking is not confirmed:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>The amount shall be refunded automatically or upon verification.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">4.3 Service Not Delivered</h3>
          <p className="mb-2">If the booked service was not delivered due to reasons attributable to the agency or platform:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Eligible refunds may be processed.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">4.4 Incorrect Charges</h3>
          <p className="mb-2">If an incorrect amount has been charged due to a technical error:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Appropriate adjustments or refunds shall be made.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. NON-REFUNDABLE CASES</h2>
          <p className="mb-2">Refunds shall generally not be provided for:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Change of mind after service completion.</li>
            <li>Customer dissatisfaction without valid evidence.</li>
            <li>Delays caused by customer unavailability.</li>
            <li>Incorrect booking details provided by the customer.</li>
            <li>Customer refusal to allow service completion.</li>
            <li>Services already completed successfully.</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. SERVICE QUALITY DISPUTES</h2>
          <p className="mb-2">If a customer believes that:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Service quality was unsatisfactory.</li>
            <li>Work was incomplete.</li>
            <li>Professional conduct was inappropriate.</li>
          </ul>
          <p className="mb-4">The customer may raise a complaint within: <strong>48 Hours of Service Completion</strong></p>
          <p className="mb-2">Flasho may:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Investigate the complaint.</li>
            <li>Request evidence.</li>
            <li>Contact the agency.</li>
            <li>Facilitate a resolution.</li>
          </ul>
          <p className="mb-2">Possible outcomes may include:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Rework service.</li>
            <li>Partial refund.</li>
            <li>Service credits.</li>
            <li>Other corrective actions.</li>
          </ul>
          <p className="mb-6">Refund approval remains subject to investigation.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. REFUND PROCESS</h2>
          <p className="mb-2">Customers may request refunds through:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Flasho Website</li>
            <li>Mobile Application</li>
            <li>Customer Support</li>
            <li>Email Support</li>
          </ul>
          <p className="mb-2">The following information may be required:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Booking ID</li>
            <li>Registered Mobile Number</li>
            <li>Description of Issue</li>
            <li>Supporting Evidence (if applicable)</li>
          </ul>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. REFUND TIMELINE</h2>
          <p className="mb-6">Once approved:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-1">UPI Payments</h4>
              <p className="text-gray-600">3–7 Business Days</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-1">Debit Card Payments</h4>
              <p className="text-gray-600">5–10 Business Days</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-1">Credit Card Payments</h4>
              <p className="text-gray-600">7–15 Business Days</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-1">Net Banking</h4>
              <p className="text-gray-600">5–10 Business Days</p>
            </div>
          </div>
          <p className="mb-6 italic text-gray-500 text-sm">Actual processing time may depend on the payment provider and banking institution.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. PLATFORM FEES</h2>
          <p className="mb-6">Certain convenience fees, platform fees, taxes, or third-party payment processing charges may be non-refundable where permitted by applicable law.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. FRAUDULENT CLAIMS</h2>
          <p className="mb-2">Flasho reserves the right to reject refund requests where:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>False information is provided.</li>
            <li>Fraudulent claims are identified.</li>
            <li>Abuse of refund policies is detected.</li>
            <li>Repeated unreasonable refund requests are made.</li>
          </ul>
          <p className="mb-6">Accounts may be restricted, suspended, or terminated for such activities.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. FORCE MAJEURE</h2>
          <p className="mb-2">Flasho shall not be responsible for delays, cancellations, or service interruptions caused by circumstances beyond reasonable control, including:</p>
          <ul className="grid grid-cols-2 gap-2 list-disc pl-6 mb-4 text-gray-600">
            <li>Natural disasters</li>
            <li>Floods</li>
            <li>Fires</li>
            <li>Government restrictions</li>
            <li>Internet outages</li>
            <li>Civil disturbances</li>
            <li>Pandemics</li>
            <li>Other force majeure events</li>
          </ul>
          <p className="mb-6">Refund eligibility in such situations shall be determined on a case-by-case basis.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. MODIFICATIONS TO THIS POLICY</h2>
          <p className="mb-4">Flasho reserves the right to modify this Refund & Cancellation Policy at any time. Updated versions shall be published on the Flasho website and application.</p>
          <p className="mb-6">Continued use of Flasho services constitutes acceptance of the revised Policy.</p>

          <hr className="my-8 border-gray-200" />

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. CONTACT US</h2>
          <p className="mb-4">For refund or cancellation-related assistance:</p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Flasho</h3>
            <ul className="space-y-2">
              <li><strong>Email:</strong> <a href="mailto:hello@flasho.services" className="text-primary hover:underline">hello@flasho.services</a></li>
              <li><strong>Phone / WhatsApp:</strong> <a href="tel:+919561850928" className="text-primary hover:underline">+91 9561850928</a> (<a href="https://wa.me/919561850928" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp</a>)</li>
              <li><strong>Location:</strong> Kolhapur, Maharashtra, India</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="font-bold text-gray-900 mb-2">ACKNOWLEDGEMENT</h3>
            <p className="text-gray-600 mb-4">By booking services through Flasho, you acknowledge that you have read, understood, and agreed to this Refund & Cancellation Policy.</p>
            <p className="font-bold text-primary italic">Flasho – Pass Hai, Fast Hai.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
