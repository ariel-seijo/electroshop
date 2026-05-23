const skeletonShimmer = "bg-[linear-gradient(90deg,rgb(22,22,22)_0%,rgb(32,32,32)_40%,rgb(40,40,40)_50%,rgb(32,32,32)_60%,rgb(22,22,22)_100%)] bg-[length:200%_100%] animate-[shimmer_1.6s_infinite_linear] rounded-[3px] motion-reduce:animate-none motion-reduce:bg-surface-22";

function SkeletonSlide() {
  return (
    <div className="flex-[0_0_100%] min-w-0 pl-2 min-[660px]:flex-[0_0_50%] min-[999px]:flex-[0_0_33.333%] min-[1300px]:flex-[0_0_25%] motion-reduce:[scroll-snap-align:start]">
      <div className="bg-[linear-gradient(160deg,rgb(24,24,24)_0%,rgb(18,18,18)_100%)] border border-white/5 rounded-md overflow-hidden md:rounded-lg">
        <div className="relative w-full aspect-square bg-[linear-gradient(90deg,rgb(14,14,14)_0%,rgb(22,22,22)_40%,rgb(30,30,30)_50%,rgb(22,22,22)_60%,rgb(14,14,14)_100%)] bg-[length:200%_100%] animate-[shimmer_1.6s_infinite_linear] motion-reduce:animate-none motion-reduce:bg-surface-22" />
        <div className="flex flex-col gap-[0.3rem] p-2 min-h-[155px] ms:gap-[0.35rem] ms:px-3 ms:py-[0.6rem] ms:pb-3 ms:min-h-[168px] md:gap-[0.42rem] md:p-[0.7rem] md:pb-4 md:min-h-[182px] lg:gap-2 lg:px-[1.2rem] lg:pb-[1.2rem] lg:pt-[0.85rem] lg:min-h-[195px]">
          <div className={`w-[40%] h-2 ${skeletonShimmer} ms:h-[9px] md:h-2.5 lg:h-[11px]`} />
          <div className={`w-[80%] h-2.5 ${skeletonShimmer} ms:h-[11px] md:h-3 lg:h-[14px]`} />
          <div className={`w-[60%] h-2.5 ${skeletonShimmer} ms:h-[11px] md:h-3 lg:h-[14px]`} />
          <div className={`w-[40%] h-2 ${skeletonShimmer} ms:h-[9px] md:h-2.5 lg:h-[11px]`} />
          <div className={`w-[50%] h-3 mt-[0.2rem] ${skeletonShimmer} ms:h-[13px] md:h-[15px] lg:h-4`} />
          <div className={`w-full h-[34px] mt-[0.3rem] rounded-[5px] bg-[linear-gradient(90deg,rgb(18,18,18)_0%,rgb(28,28,28)_40%,rgb(36,36,36)_50%,rgb(28,28,28)_60%,rgb(18,18,18)_100%)] bg-[length:200%_100%] animate-[shimmer_1.6s_infinite_linear] motion-reduce:animate-none motion-reduce:bg-surface-22 ms:h-10 ms:mt-[0.35rem] md:h-[42px] md:mt-[0.42rem] md:rounded-md lg:h-11 lg:mt-2`} />
        </div>
      </div>
    </div>
  );
}

export default function CarouselSkeleton() {
  return (
    <div className="relative w-full max-w-[1200px] mx-auto mb-6 px-4" aria-hidden="true">
      <div className="overflow-hidden py-2 md:py-2.5 md:pb-[14px] lg:py-3 lg:pb-4">
        <div className="flex ml-[-0.5rem]">
          <SkeletonSlide />
          <SkeletonSlide />
          <SkeletonSlide />
          <SkeletonSlide />
        </div>
      </div>
      <div className="flex justify-center items-center gap-2.5 mt-4 h-2.5">
        <div className="size-2.5 rounded-full bg-white/10" />
        <div className="size-2.5 rounded-full bg-white/10" />
        <div className="size-2.5 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
