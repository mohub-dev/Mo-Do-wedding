import React from 'react';
import { Sparkles, Baby, Car } from 'lucide-react';

interface EtiquetteCardsProps {
  dressCode?: string;
  childrenPolicy?: string;
  parkingPolicy?: string;
}

export const EtiquetteCards: React.FC<EtiquetteCardsProps> = ({
  dressCode = 'رسمي وأنيق يليق بفخامة الحفل',
  childrenPolicy = 'نعتذر عن استقبال الأطفال لراحتكم وسهرتكم',
  parkingPolicy = 'تتوفر أماكن مخصصة وخدمة صف سيارات أمام القاعة',
}) => {
  return (
    <div
      id="wedding-etiquette-section"
      className="w-full mx-auto py-4 sm:py-6 border-t border-[#EBE3D3] space-y-3"
    >
      <div className="text-center space-y-1">
        <h3 className="font-sans-ar text-lg sm:text-xl font-bold text-[#2B1117]">
          إرشادات وتفاصيل تهمكم
        </h3>
        <p className="font-sans-ar text-xs sm:text-sm text-[#7E3243]">
          لراحتكم ولقضاء أمسية استثنائية مليئة بالبهجة والمحبة
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
        {/* Dress Code Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border-2 border-[#E7DFCF] text-center space-y-1.5 shadow-xs hover:shadow-sm transition-all">
          <div className="w-9 h-9 rounded-full bg-[#FAF4E6] text-[#B89656] flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="font-sans-ar text-sm sm:text-base font-bold text-[#2B1117]">
            الزي المقترح
          </h4>
          <p className="font-sans-ar text-xs sm:text-sm text-[#5E2330] leading-relaxed">
            {dressCode || 'رسمي وأنيق يليق بفخامة الحفل'}
          </p>
        </div>

        {/* Children Policy */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border-2 border-[#E7DFCF] text-center space-y-1.5 shadow-xs hover:shadow-sm transition-all">
          <div className="w-9 h-9 rounded-full bg-[#FBF0F2] text-[#832E41] flex items-center justify-center mx-auto">
            <Baby className="w-4 h-4" />
          </div>
          <h4 className="font-sans-ar text-sm sm:text-base font-bold text-[#2B1117]">
            أحبابنا الصغار
          </h4>
          <p className="font-sans-ar text-xs sm:text-sm text-[#5E2330] leading-relaxed">
            {childrenPolicy || 'نعتذر عن استقبال الأطفال لراحتكم وسهرتكم'}
          </p>
        </div>

        {/* Valet & Parking */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 border-2 border-[#E7DFCF] text-center space-y-1.5 shadow-xs hover:shadow-sm transition-all">
          <div className="w-9 h-9 rounded-full bg-[#F7EFF1] text-[#832E41] flex items-center justify-center mx-auto">
            <Car className="w-4 h-4" />
          </div>
          <h4 className="font-sans-ar text-sm sm:text-base font-bold text-[#2B1117]">
            صف السيارات
          </h4>
          <p className="font-sans-ar text-xs sm:text-sm text-[#5E2330] leading-relaxed">
            {parkingPolicy || 'تتوفر أماكن مخصصة وخدمة صف سيارات أمام القاعة'}
          </p>
        </div>
      </div>
    </div>
  );
};
