export const STORE = {
  name: "Sohoj Life",
  tagline: "সহজে কিনুন, নিশ্চিন্তে থাকুন",
  whatsapp: "8801303422278",
  currency: "৳",
  deliveryInsideDhaka: 80,
  deliveryOutsideDhaka: 130,
};

export function whatsappUrl(message: string) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}
