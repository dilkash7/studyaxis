'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function WhatsAppButton() {
  const [number, setNumber] = useState('919148528115'); // Default number

  useEffect(() => {
    axios.get('/api/settings/homepage')
      .then(r => { if (r.data.whatsapp) setNumber(r.data.whatsapp); })
      .catch(() => {});
  }, []);

  return (
    <a href={`https://wa.me/${number}`} target="_blank"
      className="fixed bottom-6 right-24 z-50 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition hover:scale-110 text-2xl"
      title="WhatsApp Us">
      💬
    </a>
  );
}