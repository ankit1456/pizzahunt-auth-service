export function formatEnumMessage(validValues: string[]) {
  if (validValues.length === 1) return validValues[0];
  if (validValues.length === 2) return validValues.join(' or ');

  return `${validValues.slice(0, -1).join(', ')} or ${validValues[validValues.length - 1]}`;
}
