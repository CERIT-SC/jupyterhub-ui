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
  isCardSelected,
}: {
  cards: React.ReactNode[];
  customCard?: React.ReactNode;
  isCardSelected?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = customCard !== undefined || isCardSelected;

  useEffect(() => {
    if (isCardSelected) {
      setIsExpanded(false);
    }
  }, [isCardSelected]);

  const cardNum = 3;
  const visibleCards =
    shouldCollapse && !isExpanded
      ? cards.slice(0, customCard ? cardNum - 1 : cardNum)
      : cards;
  const hasMoreCards = customCard
    ? cards.length + 1 > cardNum
    : cards.length > cardNum;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customCard}
        {visibleCards}
      </div>

      {shouldCollapse && hasMoreCards && (
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
                Show More ({cards.length - cardNum} more)
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
