"use client";

import React from "react";
import ResultCard from "../ResultCard";
import type { Car, SearchResult, BookingContext } from "@/lib/types";
import { formatDate } from "@/lib/booking";
import {
  Section,
  InfoBar,
  InfoItem,
  InfoLabel,
  InfoSep,
  StepsRow,
  StepCard,
  StepNumber,
  StepBody,
  StepTitle,
  Heading,
  Subtext,
  EmptyState,
  Grid,
} from "./styles";

interface Props {
  result: SearchResult;
  cars: Car[];
  blockedImgs?: string[];
  onBook: (ctx: BookingContext) => void;
}

export default function SearchResultsOverview({ result, cars, blockedImgs = [], onBook }: Props) {
  const { pickupLocation, pickupDate, returnDate, days } = result;
  const availableCount = cars.length - blockedImgs.length;
  const hasDates = pickupDate !== "" && returnDate !== "" && days > 0;
  const datesText = hasDates
    ? `${formatDate(pickupDate)} - ${formatDate(returnDate)} (${days} dana)`
    : "Termin nije ispravno odabran";

  return (
    <Section>
      <InfoBar>
        <InfoItem>
          <InfoLabel>PICK-UP</InfoLabel>
          {pickupLocation.toUpperCase()}
        </InfoItem>
        <InfoSep>|</InfoSep>
        <InfoItem>
          <InfoLabel>PERIOD</InfoLabel>
          {datesText}
        </InfoItem>
        <InfoSep>|</InfoSep>
        <InfoItem>
          <InfoLabel>DOSTUPNO</InfoLabel>
          {availableCount} / {cars.length} VOZILA
        </InfoItem>
      </InfoBar>

      <StepsRow>
        <StepCard>
          <StepNumber>1</StepNumber>
          <StepBody>
            <StepTitle>Provjerite termin</StepTitle>
            Odmah gore vidite lokaciju, period i koliko vozila je slobodno za taj termin.
          </StepBody>
        </StepCard>
        <StepCard>
          <StepNumber>2</StepNumber>
          <StepBody>
            <StepTitle>Odaberite auto</StepTitle>
            Kliknite na vozilo koje zelite. Cijena i status dostupnosti su vec prilagodjeni terminu.
          </StepBody>
        </StepCard>
        <StepCard>
          <StepNumber>3</StepNumber>
          <StepBody>
            <StepTitle>Potvrdite preko emaila</StepTitle>
            Ostavite kontakt i rezervacija se finalizuje tek kada potvrdite email link.
          </StepBody>
        </StepCard>
      </StepsRow>

      <Heading>VOZILA ZA ODABRANI TERMIN</Heading>
      <Subtext>
        Kartice ispod prikazuju stvarnu dostupnost i cijenu za vas period, bez dodatnog racunanja.
      </Subtext>

      {availableCount === 0 && (
        <EmptyState>
          Nijedno vozilo nije slobodno za ovaj termin. Promijenite datume iznad i rezultat ce se odmah
          prilagoditi bez vracanja na pocetnu stranu.
        </EmptyState>
      )}

      <Grid>
        {cars.map((car) => (
          <ResultCard
            key={car.img}
            car={car}
            days={days}
            pickupDate={pickupDate}
            returnDate={returnDate}
            isBlocked={blockedImgs.includes(car.img)}
            onBook={onBook}
          />
        ))}
      </Grid>
    </Section>
  );
}
