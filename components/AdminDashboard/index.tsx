"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Page,
  Header,
  Title,
  LogoutBtn,
  SectionTitle,
  CarsGrid,
  CarCalendarCard,
  CarHeader,
  CarThumb,
  CarName,
  CalendarWrap,
  MonthNav,
  MonthLabel,
  NavBtn,
  WeekRow,
  WeekDay,
  DaysGrid,
  DayCell,
  BookingsTable,
  Th,
  Td,
  StatusBadge,
  ActionBtn,
  EmptyMsg,
} from "./styles";
import { CAR_DATA } from "@/lib/carData";
import type { Booking } from "@/lib/db";

const WEEK_DAYS = ["Po", "Ut", "Sr", "Če", "Pe", "Su", "Ne"];

const MONTH_NAMES = [
  "Januar", "Februar", "Mart", "April", "Maj", "Juni",
  "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar",
];

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildCalendar(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Mon=0 format
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

async function fetchBlockedSet(rangeStart: string, rangeEnd: string): Promise<Set<string>> {
  const res = await fetch(`/api/admin/availability?start=${rangeStart}&end=${rangeEnd}`);
  if (!res.ok) {
    return new Set<string>();
  }

  const data = await res.json();
  const nextSet = new Set<string>();
  for (const item of data.blocked as { car_img: string; date: string }[]) {
    nextSet.add(`${item.car_img}__${item.date}`);
  }

  return nextSet;
}

function fmtDate(s: string | null): string {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}.`;
}

interface Props {
  initialBookings: Booking[];
}

export default function AdminDashboard({ initialBookings }: Props) {
  const router = useRouter();
  const today = new Date();
  const todayStr = toYMD(today.getFullYear(), today.getMonth(), today.getDate());

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [blockedSet, setBlockedSet] = useState<Set<string>>(new Set());
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Compute range for current displayed month
  const rangeStart = toYMD(year, month, 1);
  const rangeEnd = toYMD(year, month, new Date(year, month + 1, 0).getDate());

  useEffect(() => {
    let active = true;

    async function loadBlocked() {
      const nextSet = await fetchBlockedSet(rangeStart, rangeEnd);
      if (active) {
        setBlockedSet(nextSet);
      }
    }

    void loadBlocked();

    return () => {
      active = false;
    };
  }, [rangeStart, rangeEnd]);

  async function toggleDate(carImg: string, date: string) {
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carImg, date }),
    });
    setBlockedSet(await fetchBlockedSet(rangeStart, rangeEnd));
  }

  async function handleBookingAction(id: string, action: "confirm" | "cancel") {
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const res = await fetch("/api/admin/bookings");
    if (res.ok) {
      const data = await res.json();
      setBookings(data.bookings);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const cells = buildCalendar(year, month);

  return (
    <Page>
      <Header>
        <Title>ADMIN DASHBOARD</Title>
        <LogoutBtn onClick={handleLogout}>Odjava</LogoutBtn>
      </Header>

      <SectionTitle>DOSTUPNOST AUTOMOBILA</SectionTitle>
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#666", marginBottom: 20 }}>
        Kliknite na datum da blokirate / deblokirate automobil za taj dan. Crveno = zauzeto.
      </p>

      <CarsGrid>
        {CAR_DATA.map((car) => (
          <CarCalendarCard key={car.img}>
            <CarHeader>
              <CarThumb $img={car.img} />
              <CarName>{car.name}</CarName>
            </CarHeader>

            <CalendarWrap>
              <MonthNav>
                <NavBtn onClick={prevMonth}>‹</NavBtn>
                <MonthLabel>{MONTH_NAMES[month]} {year}</MonthLabel>
                <NavBtn onClick={nextMonth}>›</NavBtn>
              </MonthNav>

              <WeekRow>
                {WEEK_DAYS.map((d) => <WeekDay key={d}>{d}</WeekDay>)}
              </WeekRow>

              <DaysGrid>
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <DayCell key={idx} $blocked={false} $today={false} $empty $past={false} />;
                  }
                  const dateStr = toYMD(year, month, day);
                  const blocked = blockedSet.has(`${car.img}__${dateStr}`);
                  const isToday = dateStr === todayStr;
                  const isPast = dateStr < todayStr;
                  return (
                    <DayCell
                      key={idx}
                      $blocked={blocked}
                      $today={isToday}
                      $empty={false}
                      $past={isPast}
                      onClick={() => !isPast && toggleDate(car.img, dateStr)}
                    >
                      {day}
                    </DayCell>
                  );
                })}
              </DaysGrid>
            </CalendarWrap>
          </CarCalendarCard>
        ))}
      </CarsGrid>

      <SectionTitle>REZERVACIJE</SectionTitle>

      {bookings.length === 0 ? (
        <EmptyMsg>Nema rezervacija.</EmptyMsg>
      ) : (
        <BookingsTable>
          <thead>
            <tr>
              <Th>AUTO</Th>
              <Th>PERIOD</Th>
              <Th>IME I PREZIME</Th>
              <Th>TELEFON</Th>
              <Th>EMAIL</Th>
              <Th>KONTAKT</Th>
              <Th>CIJENA</Th>
              <Th>STATUS</Th>
              <Th>DATUM</Th>
              <Th>AKCIJE</Th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <Td>{b.car_name ?? "—"}</Td>
                <Td>
                  {b.pickup_date
                    ? `${fmtDate(b.pickup_date)} – ${fmtDate(b.return_date)} (${b.days}d)`
                    : "—"}
                </Td>
                <Td><strong style={{ color: "#fff" }}>{b.customer_name}</strong></Td>
                <Td>{b.customer_phone}</Td>
                <Td>{b.customer_email}</Td>
                <Td>{b.contact_preference}</Td>
                <Td style={{ color: "var(--yellow-bar)" }}>
                  {b.total_price ? `${b.total_price} KM` : "Po dogovoru"}
                </Td>
                <Td>
                  <StatusBadge $status={b.status}>{b.status}</StatusBadge>
                </Td>
                <Td style={{ color: "#555", fontSize: 12 }}>
                  {b.created_at.slice(0, 10)}
                </Td>
                <Td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {b.status === "pending" && (
                      <>
                        <ActionBtn $variant="confirm" onClick={() => handleBookingAction(b.id, "confirm")}>
                          Potvrdi
                        </ActionBtn>
                        <ActionBtn $variant="cancel" onClick={() => handleBookingAction(b.id, "cancel")}>
                          Otkaži
                        </ActionBtn>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <ActionBtn $variant="cancel" onClick={() => handleBookingAction(b.id, "cancel")}>
                        Otkaži
                      </ActionBtn>
                    )}
                    {b.status === "cancelled" && (
                      <span style={{ color: "#444", fontSize: 12 }}>—</span>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </BookingsTable>
      )}
    </Page>
  );
}
