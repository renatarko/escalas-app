import { Tab } from "@/app/_components/tab";
import { auth } from "@/server/auth";

export default async function Admin() {
  const session = await auth();

  if (!session?.user.role) {
    return <div>nao tem session</div>;
  }

  return <Tab />;
}
