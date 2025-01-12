import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BusPositionCard } from "@/components/ComponentsOnSheet/BusPositionCard";
export default function SideBar() {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent className="bg-neutral-900">
        <SheetHeader>
          <SheetTitle className="text-white mt-5">Route01</SheetTitle>
          <SheetDescription>
            <BusPositionCard />
            <BusPositionCard />
            <BusPositionCard />
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
