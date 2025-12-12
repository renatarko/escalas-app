type TabsContentProps = {
  title: string;
  description?: string;
};

export const HeaderPanel = ({ title, description }: TabsContentProps) => {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h2 className="font-display text-foreground text-3xl font-bold">
        {title}
      </h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};
