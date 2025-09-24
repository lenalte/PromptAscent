import { Loader2 } from 'lucide-react';

export default function Loading() {

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col min-h-screen items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading Lesson...</p>
    </div>
  );
}
