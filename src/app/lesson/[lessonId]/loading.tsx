
import { Loader } from "@/components/ui/loader";
import { Loader2 } from 'lucide-react'; // Import Loader2 if needed

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
      {/* Use Loader2 directly or keep the custom Loader component */}
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      {/* <Loader size={48} /> */}
      <p className="mt-4 text-muted-foreground">Loading Lesson...</p>
    </div>
  );
}
