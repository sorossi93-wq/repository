export interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  thankYou?: string;
}

export interface GiftSection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  gifts: Gift[];
}

export interface SoldOutEntry {
  giftId: string;
  giftedBy?: string;
  claimedAt: string;
}
