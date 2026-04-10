import styled from "styled-components";
import { heavyFont } from "../shared/mixins";

export const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  z-index: 9000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px 0 40px;
  overflow-y: auto;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "all" : "none")};
  transition: opacity 0.3s ease;
`;

export const Modal = styled.div<{ $open: boolean }>`
  background: #111114;
  border: 3px solid var(--yellow-bar);
  border-radius: 10px;
  padding: 34px 34px 28px;
  width: 90%;
  max-width: 560px;
  position: relative;
  transform: ${({ $open }) =>
    $open ? "translateY(0) scale(1)" : "translateY(30px) scale(0.97)"};
  transition: transform 0.3s ease;
`;

export const CloseX = styled.button`
  position: absolute;
  top: 12px;
  right: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #aaa;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
`;

export const Title = styled.h2`
  ${heavyFont}
  font-size: 40px;
  color: var(--yellow-bar);
  margin-bottom: 10px;
  transform: scaleX(0.88);
  transform-origin: left;
`;

export const Subtitle = styled.p`
  color: #bbb;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
`;

export const Steps = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

export const Step = styled.div<{ $active?: boolean }>`
  ${heavyFont}
  font-size: 13px;
  color: ${({ $active }) => ($active ? "#000" : "var(--yellow-bar)")};
  background: ${({ $active }) =>
    $active ? "linear-gradient(180deg, #ffcc00 0%, #ff5500 100%)" : "rgba(255, 204, 0, 0.08)"};
  border: 1px solid rgba(255, 204, 0, 0.22);
  border-radius: 999px;
  padding: 7px 12px;
`;

export const SummaryBox = styled.div`
  background: rgba(255, 204, 0, 0.08);
  border: 1px solid rgba(255, 204, 0, 0.25);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 18px;
`;

export const SummaryLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #ccc;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.7;

  strong {
    color: #fff;
  }
`;

export const Notice = styled.div`
  border: 1px solid rgba(255, 204, 0, 0.18);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 18px;
  color: #d6d6d6;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
`;

export const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  ${heavyFont}
  display: block;
  color: var(--yellow-bar);
  font-size: 20px;
  margin-bottom: 6px;
  transform: scaleX(0.88);
  transform-origin: left;
`;

export const Input = styled.input`
  width: 100%;
  height: 48px;
  background: #2a2a2e;
  border: none;
  border-radius: 6px;
  color: #fff;
  padding: 0 16px;
  font-size: 15px;
  font-family: Arial, sans-serif;
  outline: none;

  &:focus {
    background: #333338;
  }
`;

export const ContactLabel = styled.span`
  ${heavyFont}
  color: var(--yellow-bar);
  font-size: 20px;
  margin-bottom: 10px;
  display: block;
  transform: scaleX(0.88);
  transform-origin: left;
`;

export const RadioGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

export const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

export const RadioInput = styled.input`
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid #555;
  background: #222;
  cursor: pointer;

  &:checked {
    background: var(--yellow-bar);
    border-color: var(--yellow-bar);
    box-shadow: 0 0 8px rgba(255, 204, 0, 0.5);
  }
`;

export const RadioIcon = styled.i`
  font-size: 22px;
  color: var(--yellow-bar);
`;

export const RadioText = styled.span`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  font-family: Arial, sans-serif;
`;

export const ErrorText = styled.p`
  color: #ff7f7f;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
`;

export const ConfirmButton = styled.button`
  ${heavyFont}
  width: 100%;
  background: linear-gradient(180deg, #ffcc00 0%, #ff5500 100%);
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 16px 0;
  font-size: 34px;
  cursor: pointer;
  box-shadow: 0 6px 0 #8a3000, 0 10px 25px rgba(0, 0, 0, 0.7);
  transition: all 0.1s;
  transform: scaleX(0.9);

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SuccessBox = styled.div`
  padding: 20px 0 10px;
  text-align: center;
`;

export const SuccessTitle = styled.h2`
  ${heavyFont}
  font-size: 34px;
  color: var(--yellow-bar);
  margin-bottom: 16px;
  transform: scaleX(0.88);
  transform-origin: center;
`;

export const SuccessText = styled.p`
  font-family: Arial, sans-serif;
  font-size: 15px;
  color: #ccc;
  line-height: 1.7;

  strong {
    color: #fff;
  }
`;
