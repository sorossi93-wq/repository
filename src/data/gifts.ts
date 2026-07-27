import type { GiftSection } from "@/lib/types";

import { siteConfig } from "@/lib/config";

export const giftSections: GiftSection[] = [
  {
    id: "honeymoon",
    title: "Honeymoon Adventures",
    subtitle: siteConfig.messages.honeymoonIntro,
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&q=80",
    gifts: [
      {
        id: "siargao-island-tour",
        name: "Siargao Island Tour — Cloud 9 & Magpupungko",
        description:
          "Cloud 9, the Magpupungko rock pools, and Coconut Road — starting the honeymoon strong and ticking all of Campbell's boxes: swimming and boats.",
        price: 200,
        image: "https://images.unsplash.com/photo-1519855079734-7f171f9c2af8?w=800&q=80",
      },
      {
        id: "couples-spa",
        name: "Couples' Spa & Wellness",
        description:
          "Sofia has been campaigning for a couples' massage for months — a morning with no snorkels, no itinerary, and nowhere to be except horizontal. We'll take it.",
        price: 250,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
      },
      {
        id: "swimming-jellyfish",
        name: "Swimming with Jellyfish",
        description:
          "Harmless, non-stinging jellyfish in Sohoton's sanctuary — we've been promised they don't sting. Sofia, our self-appointed jellyfish police, will still be conducting a full safety inspection before anyone enters the water.",
        price: 75,
        image: "https://images.unsplash.com/photo-1568069070021-2523a3003ddc?w=800&q=80",
      },
      {
        id: "siargao-island-hopping",
        name: "Siargao Island Hopping — Daku, Guyam & Secret Island",
        description:
          "Daku, Naked Island, Guyam hammocks, and the Fish Sanctuary. A full day of swimming between islands — exactly the kind of trip we had in mind when we booked the Philippines.",
        price: 150,
        image: "https://images.unsplash.com/photo-1771533679926-65e53e4ea7e7?w=800&q=80",
      },
      {
        id: "sohoton-adventure",
        name: "Sohoton Cove Adventure",
        description:
          "Emerald lagoons, limestone caves, and water so clear it barely feels real. One of the places we're most excited to swim — the kind of day that makes the whole trip feel worth it.",
        price: 150,
        image: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80",
      },
      {
        id: "el-nido-big-lagoon",
        name: "Big Lagoon & Bacuit Bay Tour",
        description:
          "Paddling through Bacuit Bay into the Big Lagoon, then the Secret Lagoon and Shimizu Island. The limestone cliffs alone are worth it — the swimming is the bonus.",
        price: 150,
        image: "https://images.unsplash.com/photo-1583685209046-3898ff0f8de1?w=800&q=80",
      },
      {
        id: "snorkeling-el-nido",
        name: "Snorkeling at El Nido's Reefs & Lagoons",
        description:
          "Colourful corals and fish at Shimizu Island — Sofia in her element underwater, Campbell spotting things from the surface, and both of us happy to stay in as long as the boat allows.",
        price: 90,
        image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800&q=80",
      },
      {
        id: "el-nido-matinloc",
        name: "Matinloc Island & Hidden Beaches Tour",
        description:
          "Secret Beach, Hidden Beach, and lunch at the Matinloc Shrine. Quiet coves and turquoise water — the kind of day you remember long after the tan fades.",
        price: 150,
        image: "https://images.unsplash.com/photo-1749995925383-5195d00a6811?w=800&q=80",
      },
      {
        id: "private-sunset-yacht",
        name: "Private Sunset Boat, El Nido",
        description:
          "Just us on a small bangka as the sun drops over Bacuit Bay. No crowds, no rush — just the water turning gold and two people who love being in it.",
        price: 350,
        image: "https://images.unsplash.com/photo-1749468373905-9b5659cb6320?w=800&q=80",
      },
      {
        id: "beachfront-dinner",
        name: "Romantic Beachfront Dinner",
        description:
          "A table for two on the sand — candles, waves, and a rare evening where the only thing on the itinerary is staying exactly where we are.",
        price: 200,
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
      },
      {
        id: "poolside-cocktails",
        name: "Poolside Cocktails",
        description:
          "A round of cold drinks with our feet in the water — mango something, probably something pink, definitely something we wouldn't order at home.",
        price: 75,
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
      },
      {
        id: "lagoon-kayak-session",
        name: "Lagoon Kayak",
        description:
          "An hour paddling through calm turquoise water — limestone cliffs on either side, fish below, and nowhere we need to rush to.",
        price: 75,
        image: "https://images.unsplash.com/photo-1746260948447-c06796c0a901?w=800&q=80",
      },
      {
        id: "hammock-afternoon-drinks",
        name: "Hammock Afternoon & Drinks",
        description:
          "Two hammocks strung between palms, a cold drink each, and an afternoon where the only plan is not having one.",
        price: 75,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      },
      {
        id: "beach-beers",
        name: "Beers on the Beach",
        description:
          "Cold San Mig at sunset, sand between our toes, nowhere to be. The simplest kind of perfect.",
        price: 50,
        image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80",
      },
      {
        id: "fresh-coconuts",
        name: "Ice-Cold Coconuts",
        description:
          "Straight from a roadside stall — hacked open with a machete, drunk with a straw, and refilled once because we couldn't resist.",
        price: 50,
        image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800&q=80",
      },
      {
        id: "sunset-happy-hour",
        name: "Sunset Happy Hour",
        description:
          "Two seats at the bar as the sky goes orange over the water — one round turns into two, and we stay longer than planned.",
        price: 50,
        image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
      },
      {
        id: "street-food-night",
        name: "Street Food & Dinner in Town",
        description:
          "Grilled skewers, something fried we can't quite identify, and a plastic stool on a busy corner — the best kind of dinner.",
        price: 50,
        image: "https://images.unsplash.com/photo-1649342597907-ee9f16ecc49b?w=800&q=80",
      },
      {
        id: "sunset-beach-picnic",
        name: "Sunset Beach Picnic",
        description:
          "A simple spread on the sand as the sky turns gold — ripe mangoes, something grilled, and us staying until the last bit of orange disappears.",
        price: 100,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      },
      {
        id: "siargao-hotel-night-1",
        name: "Siargao — Night 1",
        description:
          "Our first night near General Luna — palm trees, warm air, and the sound of the sea from the room.",
        price: 150,
        image: "https://images.unsplash.com/photo-1722704629854-ed679b4b81b4?w=800&q=80",
      },
      {
        id: "siargao-hotel-night-2",
        name: "Siargao — Night 2",
        description:
          "Another night on the island — early mornings for swimming, late afternoons for doing very little.",
        price: 150,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      },
      {
        id: "siargao-hotel-night-3",
        name: "Siargao — Night 3",
        description:
          "Settling into island time — we've found our favourite spot for coffee and our favourite spot for getting in the water.",
        price: 150,
        image: "https://images.unsplash.com/photo-1722704629854-ed679b4b81b4?w=800&q=80",
      },
      {
        id: "siargao-hotel-night-4",
        name: "Siargao — Night 4",
        description:
          "One last Siargao morning before we move on — we'll make the most of it from the water.",
        price: 150,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      },
      {
        id: "el-nido-hotel-night-1",
        name: "El Nido — Night 1",
        description:
          "Our first night among the limestone cliffs of Bacuit Bay — waking up to a view we've been looking forward to since we booked.",
        price: 150,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      },
      {
        id: "el-nido-hotel-night-2",
        name: "El Nido — Night 2",
        description:
          "A second night in paradise — lagoons by day, stars over the bay by night.",
        price: 150,
        image: "https://images.unsplash.com/photo-1749995925383-5195d00a6811?w=800&q=80",
      },
      {
        id: "el-nido-hotel-night-3",
        name: "El Nido — Night 3",
        description:
          "We've stopped counting how many times we've been in the water today. That's the point.",
        price: 150,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      },
      {
        id: "el-nido-hotel-night-4",
        name: "El Nido — Night 4",
        description:
          "Our last night in El Nido — one more swim, one more sunset, and absolutely no alarm set.",
        price: 150,
        image: "https://images.unsplash.com/photo-1749995925383-5195d00a6811?w=800&q=80",
      },
    ],
  },
  {
    id: "material",
    title: "Home & Kitchen",
    subtitle: siteConfig.messages.materialIntro,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
    gifts: [
      {
        id: "plates",
        name: "Dinner Plates Set",
        description:
          "Sofia loves cooking for people and having them over — a proper set of dinner plates is really just an excuse to plan a nice meal and invite you.",
        price: 300,
        image: "https://images.unsplash.com/photo-1637534371564-458a3a29972f?w=800&q=80",
      },
      {
        id: "dessert-plates",
        name: "Dessert Plates Set",
        description:
          "Sofia has been promising to make Campbell his grandma's tablet recipe for six years. These plates are for when she finally does — and for every dinner party where dessert actually happens.",
        price: 200,
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
      },
      {
        id: "cutlery",
        name: "Cutlery Set",
        description:
          "We've been eating with mismatched forks from three different flat moves for years. Time for proper grown-up cutlery — the kind that makes you feel like you finally have your life together, even if you absolutely don't.",
        price: 300,
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      },
      {
        id: "wine-glasses",
        name: "Wine Glasses Set",
        description:
          "We love wine. Campbell managed to break every single glass we owned — so this is less a gift and more a public safety measure.",
        price: 250,
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
      },
    ],
  },
  {
    id: "max",
    title: "Max the Golden Retriever",
    subtitle: siteConfig.messages.maxIntro,
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=1200&q=80",
    gifts: [
      {
        id: "max-part-1",
        name: "Max — Part 1 of 6",
        description:
          "Instalment one of six — €250 toward a golden retriever named Max. Campbell was consulted once; Sofia has decided to take matters into her own hands with this registry. She's started doing the maths — maybe fewer work trips, maybe a dog walker once a week. Campbell still hasn't seen this section.",
        price: 250,
        image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&q=80",
      },
      {
        id: "max-part-2",
        name: "Max — Part 2 of 6",
        description:
          "Instalment two — another €250 toward the same dog. Sofia has a spreadsheet now. She's worked out she can probably make it work if she cuts back on travel — she's already mentally declining the next conference invite. Campbell remains blissfully unaware that a golden retriever is being crowdfunded on our wedding registry.",
        price: 250,
        image: "https://images.unsplash.com/photo-1757191428050-a8cc08e71567?w=800&q=80",
      },
      {
        id: "max-part-3",
        name: "Max — Part 3 of 6",
        description:
          "Halfway there — €750 down, €750 to go. Sofia's excitement is starting to outweigh the logistics spreadsheet. She's looked up dog walkers in the neighbourhood and blocked out lunch breaks for walks. Campbell has not been consulted on any of this.",
        price: 250,
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80",
      },
      {
        id: "max-part-4",
        name: "Max — Part 4 of 6",
        description:
          "Four down, two to go. Max is starting to feel inevitable. Sofia has bookmarked three puppy training courses and is genuinely excited now — the job-and-travel thing still worries her, but less than it did. Campbell: oblivious. Sofia: sending golden retriever videos to the group chat with no context.",
        price: 250,
        image: "https://images.unsplash.com/photo-1768676758489-851bb9ea865a?w=800&q=80",
      },
      {
        id: "max-part-5",
        name: "Max — Part 5 of 6",
        description:
          "One instalment away from a fully funded golden retriever. Sofia has basically accepted that her career will survive with slightly less travel and a very good dog walker. She's stopped pretending she's fine about it — she's thrilled. Campbell still thinks this is a normal wedding registry.",
        price: 250,
        image: "https://images.unsplash.com/photo-1753364328575-e776429fb3af?w=800&q=80",
      },
      {
        id: "max-part-6",
        name: "Max — Part 6 of 6",
        description:
          "The final €250 — Max, fully funded. One complete golden retriever, bought in six very reasonable instalments. Sofia is ready to quit her job and get five more. Campbell still hasn't noticed. Sofia is beside herself.",
        price: 250,
        image: "https://images.unsplash.com/photo-1775806272302-879b04a870cf?w=800&q=80",
      },
    ],
  },
];

export function findGiftById(id: string) {
  for (const section of giftSections) {
    const gift = section.gifts.find((g) => g.id === id);
    if (gift) return { gift, section };
  }
  return null;
}

export function getDefaultThankYou(giftId: string, sectionId: string, giftName: string): string {
  if (giftId === "swimming-jellyfish") {
    return `You funded "${giftName}" — Sofia may still be composing herself. We'll send proof once she's cleared the jellyfish inspection.`;
  }

  if (sectionId === "max") {
    return `Thank you for "${giftName}"! Max sends a wag. Campbell still hasn't noticed this section.`;
  }

  if (sectionId === "material") {
    return `Thank you for "${giftName}"! We'll think of you every time we use it.`;
  }

  return `Thank you for "${giftName}" — we can't wait to experience it in the Philippines.`;
}
