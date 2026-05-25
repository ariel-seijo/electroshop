interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <div className="w-[1200px] mx-auto flex items-center justify-between flex-wrap">
      {children}
    </div>
  );
}
