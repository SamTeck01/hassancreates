/* eslint-disable @next/next/no-img-element */
/**
 * Cheap "big blur" background.
 *
 * A 28px CSS blur on a full-size card image is expensive: blur cost scales
 * with pixel area and gets re-rasterised whenever the parent transforms.
 * Instead we render the image at 1/8 size, blur it by 28/8 = 3.5px and scale
 * it back up 8x. The result looks the same (it's blurred anyway), costs
 * ~64x fewer pixels, and lets the browser fetch the smallest srcset entry.
 */
const FACTOR = 8;

export default function BlurredBg({
  src,
  srcSet,
  blur = 28,
  className = "",
}: {
  src: string;
  srcSet?: string;
  blur?: number;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 rounded-[inherit] z-0 overflow-hidden ${className}`} aria-hidden="true">
      <img
        src={src}
        srcSet={srcSet}
        sizes="256px"
        alt=""
        data-bg-image="true"
        decoding="async"
        loading="lazy"
        className="absolute top-0 left-0 block object-cover object-center origin-top-left"
        style={{
          width: `${100 / FACTOR}%`,
          height: `${100 / FACTOR}%`,
          filter: `blur(${blur / FACTOR}px)`,
          // slight overscale hides the soft transparent edge blur creates
          transform: `scale(${FACTOR * 1.1}) translate(-4.5%, -4.5%)`,
        }}
      />
    </div>
  );
}
