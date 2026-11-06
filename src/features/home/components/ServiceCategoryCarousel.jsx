import heroImageOne from "@/assets/hero-images/event-management-dhaka-01.png";
import heroImageTwo from "@/assets/hero-images/event-management-dhaka-02.png";
import heroImageThree from "@/assets/hero-images/event-management-dhaka-03.png";
import heroImageFour from "@/assets/hero-images/event-management-dhaka-04.png";
import heroImageFive from "@/assets/hero-images/event-management-dhaka-05.png";
import heroImageSix from "@/assets/hero-images/event-management-dhaka-06.png";
import heroImageSeven from "@/assets/hero-images/event-management-dhaka-07.png";

const heroImages = [
  {
    id: 1,
    src: heroImageOne,
    alt: "Event management and celebration in Dhaka - 01",
  },
  {
    id: 2,
    src: heroImageTwo,
    alt: "Professional event planning and decoration in Dhaka - 02",
  },
  {
    id: 3,
    src: heroImageThree,
    alt: "Premium event setup and venue decoration - 03",
  },
  {
    id: 4,
    src: heroImageFour,
    alt: "Creative event design and celebration - 04",
  },
  {
    id: 5,
    src: heroImageFive,
    alt: "Professional event photography and celebration - 05",
  },
  {
    id: 6,
    src: heroImageSix,
    alt: "Premium event production and management - 06",
  },
  {
    id: 7,
    src: heroImageSeven,
    alt: "Elegant event decoration and celebration in Dhaka - 07",
  },
];

const HeroImageMarquee = () => {
  return (
    <section
      className="hero-marquee w-full min-w-0 overflow-hidden"
      aria-label="Our event highlights"
    >
      <div className="hero-marquee-track flex w-max">
        {[0, 1].map((group) => (
          <div
            key={group}
            className="hero-marquee-group flex shrink-0 items-center gap-3 sm:gap-4"
            aria-hidden={group === 1}
          >
            {heroImages.map((image) => (
              <div
                key={`${group}-${image.id}`}
                className="flex shrink-0 items-center"
              >
                <img
                  src={image.src}
                  alt={group === 0 ? image.alt : ""}
                  className="block h-40 w-auto object-contain sm:h-48 lg:h-52 shadow-lg rounded-md"
                  loading={group === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroImageMarquee;
