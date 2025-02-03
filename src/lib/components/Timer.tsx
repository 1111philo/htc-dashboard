import { useState } from "react";

export default function Timer({
  slotStart,
  slotTimeLength,
  setIsExpired,
}: {
  slotStart: string;
  slotTimeLength: number;
  setIsExpired: React.Dispatch<React.SetStateAction<boolean>>;
}) {

  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Set the date we're counting down to
  const countDownDate = new Date(slotStart).getTime() + slotTimeLength * 60000; // 60000ms per minute

  // Update the count down every 1 second
  const countdown = setInterval(() => {
    // Get today's date and time
    const now = new Date().getTime();

    // Find the timeLeft between now and the count down date
    const timeLeft = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // build time remaining string
    setTimeRemaining(`${minutes}m ${seconds}s`)

    // If the count down is finished, write some text
    if (timeLeft < 0) {
      setIsExpired(true)
      clearInterval(countdown);
    }
  }, 1000);

  return (
    <div>
      <span>Time Remaining: {timeRemaining}</span>
    </div>
  );
}
