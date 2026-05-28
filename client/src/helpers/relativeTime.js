export function relativeTime(time) {
  const now = new Date();

  const milisecondsDifference = now - time;
  const secondsDifference = milisecondsDifference / 1000;
  const minutesDifference = secondsDifference / 60;
  const hoursDifference = minutesDifference / 60;
  const daysDifference = hoursDifference / 24;

  if (daysDifference > 365) {
    return `${Math.floor(daysDifference / 365)} years ago`;
  }
  if (daysDifference > 30 * 2) {
    return `${Math.floor(daysDifference / 30)} months ago`;
  }
  if (daysDifference > 7 * 2) {
    return `${Math.floor(daysDifference / 7)} weeks ago`;
  }
  if (daysDifference > 2) {
    return `${Math.floor(daysDifference)} days ago`;
  }
  if (hoursDifference > 2) {
    return `${Math.floor(hoursDifference)} hours ago`;
  }
  if (minutesDifference > 2) {
    return `${Math.floor(minutesDifference)} minutes ago`;
  }
  if (secondsDifference > 2) {
    return `${Math.floor(secondsDifference)} seconds ago`;
  }
  return "just now";
}
