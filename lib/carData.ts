import type { Car } from "./types";

export const CAR_DATA: Car[] = [
  { name: "MERCEDES-BENZ E220",  img: "/5.jpeg",   price1: 150, price2: 120 },
  { name: "BMW 520 F10 M OPTIC", img: "/6.jpeg",   price1: 150, price2: 120 },
  { name: "MERCEDES-BENZ E220",  img: "/002.jpeg", price1: 150, price2: 120 },
  { name: "RENAULT MEGANE",      img: "/009.jpeg", price1: 70,  price2: 60  },
  { name: "FORD KUGA",           img: "/2.jpeg",   price1: 80,  price2: 65  },
  { name: "TOYOTA YARIS",        img: "/00.jpeg",  price1: 60,  price2: 50  },
];

export const VALID_CAR_IMGS = CAR_DATA.map((car) => car.img);

export function getCarByImg(carImg: string): Car | undefined {
  return CAR_DATA.find((car) => car.img === carImg);
}
