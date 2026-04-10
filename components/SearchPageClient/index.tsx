"use client";

import React, { useState } from "react";
import SearchResultsOverview from "../SearchResultsOverview";
import BookingFlowModal from "../BookingFlowModal";
import Footer from "../Footer";
import BookingSearchBar from "../BookingSearchBar";
import styled from "styled-components";
import type { Car, SearchResult, BookingContext } from "@/lib/types";

interface Props {
  result: SearchResult;
  cars: Car[];
  blockedImgs: string[];
}

const PageContainer = styled.div`
  width: 96%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px 0;
`;

export default function SearchPageClient({ result, cars, blockedImgs }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingCtx, setBookingCtx] = useState<BookingContext | undefined>();

  function handleBook(ctx: BookingContext) {
    setBookingCtx(ctx);
    setBookingOpen(true);
  }

  return (
    <>
      <PageContainer>
        <BookingSearchBar key={`${result.pickupDate}-${result.returnDate}`} initialResult={result} />
        <SearchResultsOverview result={result} cars={cars} blockedImgs={blockedImgs} onBook={handleBook} />
      </PageContainer>
      <BookingFlowModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        bookingContext={bookingCtx}
      />
      <Footer />
    </>
  );
}
