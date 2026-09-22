"use client";

import { useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger, cn } from "@venore/plugin-sdk/ui";
import type { PublicBirthdayView } from "../features/list-public-birthdays/types";

// Balão fecha com um atraso curto (não no mouseleave imediato) pra tolerar o gap entre o botão do
// dia e o PopoverContent (portal, renderizado fora da célula) — sem isso, mover o mouse na
// diagonal pra ler o balão fecha ele antes de chegar lá.
const CLOSE_DELAY_MS = 150;

export function BirthdayCalendarDay({
  day,
  birthdays,
  isToday,
}: {
  day: number;
  birthdays: PublicBirthdayView[];
  isToday: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  if (birthdays.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-14 flex-col items-center justify-center rounded-md border border-transparent text-[11px] text-muted-foreground sm:min-h-16 sm:text-xs",
          isToday && "ring-2 ring-primary ring-offset-1 ring-offset-card",
        )}
      >
        {day}
      </div>
    );
  }

  const [firstBirthday, ...otherBirthdays] = birthdays;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
          className={cn(
            "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-md border border-primary/40 bg-primary/10 p-1 text-center font-semibold text-primary ui-motion-base hover:bg-primary/15 sm:min-h-16",
            isToday && "ring-2 ring-primary ring-offset-1 ring-offset-card",
          )}
        >
          <span className="text-[11px] leading-none sm:text-xs">{day}</span>
          <span className="line-clamp-2 w-full break-words text-[9px] font-medium leading-tight sm:text-[10px]">
            {firstBirthday!.fullName.split(" ")[0]}
            {otherBirthdays.length > 0 && ` +${otherBirthdays.length}`}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-2" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
        <p className="text-xs font-semibold uppercase tracking-caps text-muted-foreground">Dia {day}</p>
        <ul className="space-y-1.5">
          {birthdays.map((birthday) => (
            <li key={birthday.id}>
              <p className="text-sm font-medium text-foreground">{birthday.fullName}</p>
              {birthday.role && <p className="text-xs text-muted-foreground">{birthday.role}</p>}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
