import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  storeName?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber = '7975614686',
  storeName = 'Chodeshwari Kirana Store',
}) => {
  const cleanPhone = phoneNumber.replace(/\D/g, '') || '7975614686';
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `Hi ${storeName}, I have an inquiry about my grocery order.`
  )}`;

  return (
    <div className="fixed bottom-18 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {/* WhatsApp Trigger Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer group active:scale-95"
        title={`Chat with ${storeName} on WhatsApp`}
      >
        {/* WhatsApp Icon */}
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold whitespace-nowrap hidden sm:inline">
          Order on WhatsApp
        </span>
      </a>
    </div>
  );
};

