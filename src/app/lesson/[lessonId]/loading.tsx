
import { Loader } from "@/components/ui/loader";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
      <Loader size={48} />
      <p className="mt-4 text-muted-foreground">Loading Lesson...</p>
    </div>
  );
}
```