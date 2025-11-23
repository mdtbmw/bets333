'use client';
import { useState, useEffect } from 'react';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';

interface CountdownProps {
  deadline: string;
}

export function Countdown({ deadline }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const deadlineDate = new Date(deadline);

    const updateCountdown = () => {
      const secondsLeft = differenceInSeconds(deadlineDate, new Date());
      if (secondsLeft <= 0) {
        setTimeLeft('Closing soon');
        if (interval) clearInterval(interval);
      } else {
        setTimeLeft(
          formatDistanceToNowStrict(deadlineDate, { addSuffix: true })
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  return <span>{timeLeft}</span>;
}
