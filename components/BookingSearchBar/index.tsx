"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrapper,
  Logo,
  FormGroup,
  Label,
  InputContainer,
  TextInput,
  InputIcon,
  SearchButton,
  MetaRow,
  MetaInfo,
  MetaPill,
  HelperText,
  ErrorText,
} from "./styles";
import DatePicker from "../DatePicker";
import type { SearchResult } from "@/lib/types";
import {
  BOOKING_LOCATION,
  diffDays,
  formatDate,
  getTodayDateString,
  isDateRangeValid,
  shiftDate,
} from "@/lib/booking";

interface Props {
  initialResult?: Partial<SearchResult>;
}

export default function BookingSearchBar({ initialResult }: Props) {
  const router = useRouter();
  const [pickupLocation] = useState(BOOKING_LOCATION);
  const [pickupDate, setPickupDate] = useState(initialResult?.pickupDate ?? "");
  const [returnDate, setReturnDate] = useState(initialResult?.returnDate ?? "");
  const [error, setError] = useState("");

  const today = getTodayDateString();
  const returnMinDate = pickupDate ? shiftDate(pickupDate, 1) ?? today : today;
  const hasValidRange = pickupDate !== "" && returnDate !== "" && isDateRangeValid(pickupDate, returnDate);
  const tripDays = hasValidRange ? diffDays(pickupDate, returnDate) : 0;

  function handleSearch() {
    if (!pickupDate || !returnDate) {
      setError("Odaberite datum preuzimanja i datum povratka.");
      return;
    }

    if (!isDateRangeValid(pickupDate, returnDate)) {
      setError("Datum povratka mora biti poslije datuma preuzimanja.");
      return;
    }

    setError("");

    const params = new URLSearchParams({
      pickupDate,
      returnDate,
      pickupLocation,
      days: String(diffDays(pickupDate, returnDate)),
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <Wrapper id="search-bar">
      <Logo>
        <span>DISS</span>
        <span>RENT</span>
      </Logo>

      <FormGroup>
        <Label>LOKACIJA PREUZIMANJA</Label>
        <InputContainer>
          <TextInput type="text" value={pickupLocation} readOnly />
          <InputIcon className="fa-solid fa-location-dot" />
        </InputContainer>
      </FormGroup>

      <FormGroup>
        <Label>DATUM PREUZIMANJA</Label>
        <DatePicker
          key={`pickup-${pickupDate || today}`}
          value={pickupDate}
          onChange={(date) => {
            setPickupDate(date);
            setError("");
            if (returnDate && returnDate <= date) {
              setReturnDate("");
            }
          }}
          placeholder="Odaberite datum"
          minDate={today}
          rangeStart={pickupDate}
          rangeEnd={returnDate}
        />
      </FormGroup>

      <FormGroup>
        <Label>DATUM POVRATKA</Label>
        <DatePicker
          key={`return-${returnDate || returnMinDate}`}
          value={returnDate}
          onChange={(date) => {
            setReturnDate(date);
            setError("");
          }}
          placeholder="Odaberite datum"
          minDate={returnMinDate}
          rangeStart={pickupDate}
          rangeEnd={returnDate}
        />
      </FormGroup>

      <SearchButton type="button" onClick={handleSearch}>
        PRETRAZI SADA
      </SearchButton>

      <MetaRow>
        <MetaInfo>
          {hasValidRange ? (
            <>
              <MetaPill>{tripDays} DANA</MetaPill>
              <MetaPill>
                {formatDate(pickupDate)} - {formatDate(returnDate)}
              </MetaPill>
            </>
          ) : (
            <HelperText>Odaberite termin da odmah vidite realnu dostupnost i cijenu.</HelperText>
          )}
        </MetaInfo>

        {!error && hasValidRange && (
          <HelperText>
            Izaberite auto, ostavite kontakt i potvrdite rezervaciju preko emaila.
          </HelperText>
        )}
      </MetaRow>

      {error && <ErrorText role="alert">{error}</ErrorText>}
    </Wrapper>
  );
}
