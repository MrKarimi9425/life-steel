export function mapLinks(latitude: number, longitude: number) {
  const point = `${latitude},${longitude}`;
  return {
    browser: `https://balad.ir/location?latitude=${latitude}&longitude=${longitude}&zoom=16`,
    android: `geo:${point}?q=${point}`,
    apple: `https://maps.apple.com/?ll=${point}&q=${encodeURIComponent("Life Steel")}`,
  };
}
