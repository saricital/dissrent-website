import React from "react";
import {
  Section,
  Header,
  Eyebrow,
  Title,
  Text,
  Cards,
  Card,
  CardNumber,
  CardTitle,
  CardText,
  Strip,
  StripItem,
} from "./styles";

export default function HomeReadySection() {
  return (
    <Section>
      <Header>
        <Eyebrow>SPREMNO ZA BRZU REZERVACIJU</Eyebrow>
        <Title>KAKO REZERVACIJA RADI</Title>
        <Text>
          Pocetna sada vodi korisnika kroz cijeli tok bez zabune: prvo odabir termina, zatim auto i
          na kraju potvrda preko emaila. Tako korisnik uvijek zna sta je sledeci korak i zasto.
        </Text>
      </Header>

      <Cards>
        <Card>
          <CardNumber>01</CardNumber>
          <CardTitle>Izaberite termin</CardTitle>
          <CardText>
            Odmah na vrhu birate datum preuzimanja i datum povratka. Sistem zatim prikazuje samo realnu
            dostupnost i cijene za taj period.
          </CardText>
        </Card>
        <Card>
          <CardNumber>02</CardNumber>
          <CardTitle>Odaberite auto</CardTitle>
          <CardText>
            Svaka kartica prikazuje da li je vozilo slobodno, kolika je ukupna cijena i da li termin
            zahtijeva ponudu po dogovoru.
          </CardText>
        </Card>
        <Card>
          <CardNumber>03</CardNumber>
          <CardTitle>Potvrdite preko emaila</CardTitle>
          <CardText>
            Nakon slanja forme stize email potvrde. Rezervacija se finalizuje tek nakon klika na link,
            pa nema konfuzije ni laznih prijava.
          </CardText>
        </Card>
      </Cards>

      <Strip>
        <StripItem>Bez depozita</StripItem>
        <StripItem>Bez skrivenih troskova</StripItem>
        <StripItem>Brza potvrda rezervacije</StripItem>
        <StripItem>Kontakt putem Viber-a ili SMS-a</StripItem>
      </Strip>
    </Section>
  );
}
