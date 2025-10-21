import { TabsContent } from "./ui/tabs";

type TabsContentProps = React.ComponentProps<typeof TabsContent> & {
  title: string;
  children: React.ReactNode;
};

export const TabsContentCustom = ({
  children,
  title,
  value,
}: TabsContentProps) => {
  return (
    <TabsContent className="min-h-20 w-full px-4 pb-4" value={value}>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {children}
      </div>
    </TabsContent>
  );
};
