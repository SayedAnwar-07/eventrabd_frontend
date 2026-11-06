import heroImageOne from "@/assets/hero-images/event-management-dhaka-08.jpg";
import heroImageTwo from "@/assets/hero-images/event-management-dhaka-14.jpg";
import heroImageThree from "@/assets/hero-images/event-management-dhaka-09.jpg";
import heroImageFour from "@/assets/hero-images/event-management-dhaka-10.jpg";
import heroImageFive from "@/assets/hero-images/event-management-dhaka-11.jpg";
import heroImageSix from "@/assets/hero-images/event-management-dhaka-12.jpg";
import heroImageSeven from "@/assets/hero-images/event-management-dhaka-13.jpg";

const heroImages = [
  {
    id: 1,
    src: heroImageOne,
    alt: "Event management and celebration",
    position: "collage-one",
  },
  {
    id: 2,
    src: heroImageTwo,
    alt: "Professional event decoration",
    position: "collage-two",
  },
  {
    id: 3,
    src: heroImageThree,
    alt: "Premium event setup",
    position: "collage-three",
  },
  {
    id: 4,
    src: heroImageFour,
    alt: "Creative event experience",
    position: "collage-four",
  },
  {
    id: 5,
    src: heroImageFive,
    alt: "Professional event photography",
    position: "collage-five",
  },
  {
    id: 6,
    src: heroImageSix,
    alt: "Elegant event production",
    position: "collage-six",
  },
  {
    id: 7,
    src: heroImageSeven,
    alt: "Beautiful celebration decoration",
    position: "collage-seven",
  },
];

const HeroImageCollage = () => {
  return (
    <div className="hero-collage">
      {/* COLLAGE BACKGROUND */}

      <div className="collage-background" />

      {/* IMAGE COLLECTION */}

      {heroImages.map((image, index) => (
        <div
          key={image.id}
          className={`collage-image ${image.position}`}
          style={{ "--image-index": index }}
        >
          <img
            src={image.src}
            alt={image.alt}
            loading={index < 3 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* DECORATIVE ORBIT */}

      <div className="collage-orbit" />

      {/* CENTER CAPTION */}

      <div className="collage-caption">
        <span>EVENTRA BD</span>

        <span>CELEBRATE BEAUTIFULLY</span>
      </div>
    </div>
  );
};

export default HeroImageCollage;
