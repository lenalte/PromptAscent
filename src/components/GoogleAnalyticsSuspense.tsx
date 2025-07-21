import { Suspense } from "react";
import GoogleAnalytics from "./GoogleAnalytics";

export default function GoogleAnalyticsSuspense() {
    return (
        <Suspense fallback={null}>
            <GoogleAnalytics />
        </Suspense>
    );
}
