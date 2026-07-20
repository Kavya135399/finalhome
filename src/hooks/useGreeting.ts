import { useState, useEffect } from 'react';

export function useGreeting(name?: string) {
  // Store the current Date in state to trigger updates when the time changes
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 10000); // Update every 10 seconds to keep the hour accurate

    return () => clearInterval(interval);
  }, []);

  // Calculate the greeting dynamically on every render
  const hour = time.getHours();
  let greet = 'Good morning';
  let emoji = '👋';

  if (hour >= 12 && hour < 17) {
    greet = 'Good afternoon';
    emoji = '☀️';
  } else if (hour >= 17 && hour < 22) {
    greet = 'Good evening';
    emoji = '🌆';
  } else if (hour >= 22 || hour < 5) {
    greet = 'Good night';
    emoji = '🌙';
  }

  const displayName = name ? name.trim().split(' ')[0] : '';
  return displayName ? `${greet}, ${displayName}! ${emoji}` : `${greet}! ${emoji}`;
}
