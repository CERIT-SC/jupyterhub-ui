import React, { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SelectionCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { selected: boolean }
>(({ className, children, selected, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "relative overflow-hidden cursor-pointer group",
      "transition-all duration-300 ease-in-out transform",
      "hover:shadow-lg  hover:-translate-y-1",
      "border-2 transition-colors ",
      selected
        ? "border-infra-primary shadow-md shadow-primary/20 bg-linear-45  from-white from-85% via-infra-primary to-infra-accent"
        : "border-infra-border hover:border-infra-primary/30",
      "active:scale-95",
      className,
    )}
    {...props}
  >
    {/* Check mark indicator */}
    <div
      className={cn(
        "absolute top-0 right-0 z-10",
        "size-12 rounded-full flex items-center justify-center",
        "transition-all duration-300 ease-in-out",
        selected
          ? ""
          : "bg-infra-accent/20 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50",
      )}
    >
      <Check
        className={cn(
          "size-7 transition-all duration-200",
          selected ? "text-white" : "text-infra-primary",
        )}
      />
    </div>
    {children}
  </Card>
));

SelectionCard.displayName = "SelectionCard";

const SelectionCardGrid = ({
  cards,
  customCard,
}: {
  cards: React.ReactNode[];
  customCard?: React.ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // data state logic
  
  const { allCards, selectionIndex } = React.useMemo(() => {
    const allCards = customCard ? [customCard, ...cards] : cards;
    const selectedIndex = allCards.findIndex((el) => {
      if (!React.isValidElement(el)) return false;
      return Boolean((el as any).props?.selected);
    });

    return { allCards: allCards, selectionIndex: selectedIndex };
  }, [customCard, cards]);

  // UI state logic

  useEffect(() => {
    setIsExpanded(false);
  }, [selectionIndex]);

  const { visibleCards, hiddenCount, showMoreButton } = React.useMemo(() => {
    const columns = 3;

    if (selectionIndex === -1)
    {
      return {
        visibleCards: allCards,
        hiddenCount: 0,
        showMoreButton: false,
      };
    }

    if (isExpanded) {
      return {
        visibleCards: allCards,
        hiddenCount: 0,
        showMoreButton: true,
      };
    }

    const rowIndex = Math.floor(selectionIndex / columns);
    const sliceStart = rowIndex * columns;
    const sliceEnd = Math.min(sliceStart + columns, allCards.length);

    const visibleCards = allCards.slice(sliceStart, sliceEnd);

    return {
      visibleCards: visibleCards,
      hiddenCount: Math.max(0, allCards.length - visibleCards.length),
      showMoreButton: visibleCards.length < allCards.length,
    };
  }, [allCards, selectionIndex, isExpanded]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleCards}
      </div>

      { showMoreButton && (
        <div className="flex justify-center">
          <Button
            className="gap-2"
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                {hiddenCount > 0 ? `Show More (${hiddenCount} more)` : "Show More"}
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export { SelectionCard, SelectionCardGrid };
