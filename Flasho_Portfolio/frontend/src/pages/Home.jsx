import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

import Hero from '../components/Hero';
import Services from '../components/Services';
import HowItWorks from '../components/HowItWorks';
import WhyFlasho from '../components/WhyFlasho';
import SocialImpact from '../components/SocialImpact';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import JoinEcosystem from '../components/JoinEcosystem';

import PartnerModal from '../components/PartnerModal';

export default function Home() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerType, setPartnerType] = useState('');
  const location = useLocation();

  useSEO({
    title: 'Flasho — Trusted Home Services in Kolhapur | Cleaning, Electrician, Plumber & More',
    description: "Flasho is Kolhapur's most trusted home services platform. Book verified professionals for Cleaning, AC Repair, Electrician, Painting & Plumbing. Fast booking, transparent pricing. Pass hai, fast hai!",
    canonical: '/'
  });

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const handleOpenPartner = (type) => {
    setPartnerType(type);
    setIsPartnerModalOpen(true);
  };

  return (
    <>
      <Toaster position="top-center" />

      <Hero />
      <Services />
      <HowItWorks />
      <WhyFlasho />
      <SocialImpact />
      <Testimonials />
      <FAQ />
      <JoinEcosystem
        onOpenPartnerModal={handleOpenPartner}
      />

      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        initialType={partnerType}
      />
    </>
  );
}
