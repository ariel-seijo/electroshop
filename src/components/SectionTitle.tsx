interface SectionTitleProps {
  children: React.ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="w-full flex justify-center items-center gap-6 my-12.5 before:content-[''] before:w-[220px] before:h-0.5 before:bg-gradient-to-r before:from-transparent before:to-accent after:content-[''] after:w-[220px] after:h-0.5 after:bg-gradient-to-l after:from-transparent after:to-accent">
      <h2 className="font-cosmic text-[2rem] tracking-[3px] text-[rgb(202,202,202)] text-center font-thin whitespace-nowrap">
        {children}
      </h2>
    </div>
  );
}
