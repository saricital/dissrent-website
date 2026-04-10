import React from "react";
import db from "@/lib/db";
import { CAR_DATA } from "@/lib/carData";
import SearchPageClient from "@/components/SearchPageClient";
import type { SearchResult } from "@/lib/types";
import { BOOKING_LOCATION, diffDays, getTodayDateString, isDateRangeValid } from "@/lib/booking";

interface PageProps {
  searchParams: Promise<{ pickupDate?: string; returnDate?: string; pickupLocation?: string; days?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pickupDate = typeof params.pickupDate === "string" ? params.pickupDate : "";
  const returnDate = typeof params.returnDate === "string" ? params.returnDate : "";
  const isValidRange =
    isDateRangeValid(pickupDate, returnDate) &&
    pickupDate >= getTodayDateString();

  const blockedImgs =
    isValidRange
      ? db.getBlockedCarsForRange(pickupDate, returnDate)
      : [];

  const result: SearchResult = {
    pickupLocation: BOOKING_LOCATION,
    pickupDate: isValidRange ? pickupDate : "",
    returnDate: isValidRange ? returnDate : "",
    days: isValidRange ? diffDays(pickupDate, returnDate) : 0,
  };

  return <SearchPageClient result={result} cars={CAR_DATA} blockedImgs={blockedImgs} />;
}
