import React from 'react';
import { Clock, Music, Utensils, Sparkles, Heart, Camera, Bell } from 'lucide-react';
import { TimelineEventItem, DEFAULT_TIMELINE_EVENTS } from '../types';

interface EventTimelineProps {
  events?: TimelineEventItem[];
}

const renderIcon = (iconType: string) => {
  switch (iconType) {
    case 'music':
      return <Music className="w-4 h-4 text-[#C4AA7E]" />;
    case 'utensils':
      return <Utensils className="w-4 h-4 text-[#C4AA7E]" />;
    case 'heart':
      return <Heart className="w-4 h-4 text-[#832E41]" />;
    case 'camera':
      return <Camera className="w-4 h-4 text-[#C4AA7E]" />;
    case 'clock':
      return <Clock className="w-4 h-4 text-[#C4AA7E]" />;
    case 'sparkles':
    default:
      return <Sparkles className="w-4 h-4 text-[#C4AA7E]" />;
  }
};

export const EventTimeline: React.FC<EventTimelineProps> = ({ events = DEFAULT_TIMELINE_EVENTS }) => {
  const activeEvents = events && events.length > 0 ? events : DEFAULT_TIMELINE_EVENTS;

  return (
    <div
      id="wedding-itinerary-section"
      className="w-full mx-auto py-4 sm:py-6 border-t border-[#EBE3D3] space-y-3"
    >
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#832E41]/10 text-[#832E41] text-xs font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>فقرات الحفل</span>
        </div>
        <h3 className="font-sans-ar text-lg sm:text-xl font-bold text-[#2B1117]">
          الجدول الزمني لليلة العمر
        </h3>
        <p className="font-sans-ar text-xs sm:text-sm text-[#7E3243]">
          يسعدنا مشاركتكم لنا في كل لحظة من لحظات هذه الليلة المميزة
        </p>
      </div>

      <div className="relative pt-1 pb-1">
        {/* Central Connecting Vertical Line */}
        <div className="absolute top-3 bottom-3 right-5 sm:right-6 w-0.5 bg-gradient-to-b from-[#C4AA7E] via-[#832E41]/30 to-[#C4AA7E] -translate-x-1/2" />

        <div className="space-y-3 sm:space-y-3.5">
          {activeEvents.map((event, idx) => (
            <div
              key={event.id || idx}
              className="relative flex items-start gap-3 sm:gap-4 pr-0.5 group text-right"
            >
              {/* Timeline Icon Node */}
              <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#FCFAF7] to-[#F7EEF0] border-2 border-[#D8C49D] text-[#3E111C] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:border-[#832E41] transition-all duration-300">
                {renderIcon(event.iconType)}
              </div>

              {/* Event Content Box */}
              <div className="flex-1 p-3.5 sm:p-4 rounded-2xl bg-white/95 hover:bg-white border-2 border-[#E8DFCF] shadow-xs hover:shadow-sm transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                  <h4 className="font-sans-ar text-sm sm:text-base font-bold text-[#2B1117]">
                    {event.title}
                  </h4>
                  <span className="font-sans-ar text-xs sm:text-sm font-bold text-[#8A713F] px-2.5 py-0.5 rounded-lg bg-[#FAF5EB] border border-[#ECDDBF]">
                    {event.time}
                  </span>
                </div>
                <p className="font-sans-ar text-xs sm:text-sm md:text-base text-[#5E2330] leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
