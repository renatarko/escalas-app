type TabsContentProps = {
  title: string;
  children: React.ReactNode;
};

export const TabsContentCustom = ({ children, title }: TabsContentProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </div>
  );
};
