import { RegisterServiceWorker } from "@/components/rummy/RegisterServiceWorker";
import { RummyGame } from "@/components/rummy/RummyGame";

export default function Home() {
  return <><main id="app"><RummyGame /></main><RegisterServiceWorker /></>;
}
