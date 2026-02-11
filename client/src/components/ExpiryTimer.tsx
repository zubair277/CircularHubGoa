import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExpiryTimerProps {
  expiryDate: Date | string;
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "compact" | "detailed";
  onExpired?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(expiryDate: Date): TimeRemaining {
  const now = new Date().getTime();
  const expiry = new Date(expiryDate).getTime();
  const difference = expiry - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    isExpired: false,
  };
}

export default function ExpiryTimer({
  expiryDate,
  className,
  showIcon = true,
  variant = "default",
  onExpired,
}: ExpiryTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(new Date(expiryDate))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(new Date(expiryDate));
      setTimeRemaining(remaining);

      if (remaining.isExpired && onExpired) {
        onExpired();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate, onExpired]);

  const getUrgencyColor = () => {
    if (timeRemaining.isExpired) return "destructive";
    if (timeRemaining.days === 0 && timeRemaining.hours < 6) return "destructive";
    if (timeRemaining.days === 0 && timeRemaining.hours < 24) return "warning";
    if (timeRemaining.days < 3) return "secondary";
    return "default";
  };

  const getUrgencyClass = () => {
    if (timeRemaining.isExpired) return "text-destructive";
    if (timeRemaining.days === 0 && timeRemaining.hours < 6) return "text-destructive";
    if (timeRemaining.days === 0 && timeRemaining.hours < 24) return "text-orange-500";
    if (timeRemaining.days < 3) return "text-yellow-600";
    return "text-muted-foreground";
  };

  const formatTimeUnit = (value: number, unit: string) => {
    return `${value}${unit}`;
  };

  if (timeRemaining.isExpired) {
    return (
      <Badge variant="destructive" className={cn("gap-1", className)}>
        {showIcon && <AlertCircle className="h-3 w-3" />}
        Expired
      </Badge>
    );
  }

  if (variant === "compact") {
    let display = "";
    if (timeRemaining.days > 0) {
      display = `${timeRemaining.days}d ${timeRemaining.hours}h`;
    } else if (timeRemaining.hours > 0) {
      display = `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    } else {
      display = `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
    }

    return (
      <Badge variant="outline" className={cn("gap-1", getUrgencyClass(), className)}>
        {showIcon && <Clock className="h-3 w-3" />}
        {display}
      </Badge>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 text-sm font-medium">
          {showIcon && <Clock className={cn("h-4 w-4", getUrgencyClass())} />}
          <span className={getUrgencyClass()}>Time Remaining</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: timeRemaining.days, label: "Days" },
            { value: timeRemaining.hours, label: "Hours" },
            { value: timeRemaining.minutes, label: "Min" },
            { value: timeRemaining.seconds, label: "Sec" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center p-2 rounded-md bg-muted"
            >
              <span className={cn("text-2xl font-bold tabular-nums", getUrgencyClass())}>
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && <Clock className={cn("h-4 w-4", getUrgencyClass())} />}
      <div className="flex items-center gap-1 text-sm font-medium tabular-nums">
        {timeRemaining.days > 0 && (
          <span className={getUrgencyClass()}>
            {formatTimeUnit(timeRemaining.days, "d")}
          </span>
        )}
        {(timeRemaining.days > 0 || timeRemaining.hours > 0) && (
          <>
            {timeRemaining.days > 0 && <span className="text-muted-foreground">:</span>}
            <span className={getUrgencyClass()}>
              {formatTimeUnit(timeRemaining.hours, "h")}
            </span>
          </>
        )}
        <span className="text-muted-foreground">:</span>
        <span className={getUrgencyClass()}>
          {formatTimeUnit(timeRemaining.minutes, "m")}
        </span>
        {timeRemaining.days === 0 && (
          <>
            <span className="text-muted-foreground">:</span>
            <span className={getUrgencyClass()}>
              {formatTimeUnit(timeRemaining.seconds, "s")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
