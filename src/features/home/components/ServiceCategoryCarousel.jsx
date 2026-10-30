import photographyIcon from "@/assets/service-icon/photography.svg";
import videographyIcon from "@/assets/service-icon/videography.svg";
import stageDesignerIcon from "@/assets/service-icon/stage_designer.svg";
import soundLightingIcon from "@/assets/service-icon/sound_lighting.svg";
import eventHallIcon from "@/assets/service-icon/event_hall.svg";
import packagesHandGiftIcon from "@/assets/service-icon/packages_hand_gift.svg";

const services = [
  { id: 1, title: "Photography", icon: photographyIcon },
  { id: 2, title: "Videography", icon: videographyIcon },
  { id: 3, title: "Stage Design", icon: stageDesignerIcon },
  { id: 4, title: "Sound & Lighting", icon: soundLightingIcon },
  { id: 5, title: "Event Hall", icon: eventHallIcon },
  { id: 6, title: "Gifts & Packages", icon: packagesHandGiftIcon },
];

const ServiceCategoryCarousel = () => {
  return (
    <div
      className="service-marquee w-full min-w-0 overflow-hidden"
      aria-label="Available event services"
    >
      <div className="service-marquee-track flex w-max">
        {[0, 1].map((group) => (
          <div
            key={group}
            className="service-marquee-group flex shrink-0 items-center gap-5 sm:gap-6"
            aria-hidden={group === 1}
          >
            {services.map((service) => (
              <div
                key={`${group}-${service.id}`}
                className="flex w-[120px] shrink-0 flex-col items-center justify-center gap-3 text-center sm:w-[145px] lg:w-[150px] xl:w-[165px]"
              >
                <img
                  src={service.icon}
                  alt={group === 0 ? service.title : ""}
                  className="h-12 w-12 object-contain transition-transform duration-500 ease-out hover:scale-110 sm:h-14 sm:w-14"
                  loading="lazy"
                />

                <p className="text-[10px] font-semibold uppercase leading-snug tracking-wide text-[#3D3530] sm:text-xs">
                  {service.title}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategoryCarousel;
