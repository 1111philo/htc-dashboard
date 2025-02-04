import { useState } from "react";

interface TimerProps {
  slotStart: string;
  slotTimeLength: number;
  setIsExpired: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Timer({
  slotStart,
  slotTimeLength,
  setIsExpired,
}: TimerProps) {

  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // slotTimeLength is length of service in minutes, 60000ms per minute
  const countDownDate = new Date(slotStart).getTime() + slotTimeLength * 60000;

  // Update the count down every 1 second
  const countdown = setInterval(() => {
    const now = new Date().getTime();

    const timeLeft = countDownDate - now;

    // Time calculations for minutes and seconds
    var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // build time remaining string
    setTimeRemaining(`${minutes}m ${seconds}s`)

    if (timeLeft <= 0) {
      clearInterval(countdown);
      setIsExpired(true);
      setTimeRemaining(`0m 0s`)
    }
  }, 1000);

  return (
    <div>
      <span>Time Remaining: {timeRemaining}</span>
    </div>
  );
}
