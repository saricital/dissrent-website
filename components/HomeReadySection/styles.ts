import styled from "styled-components";
import { heavyFont } from "../shared/mixins";

export const Section = styled.section`
  margin-top: 34px;
  margin-bottom: 14px;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 22px;
`;

export const Eyebrow = styled.div`
  ${heavyFont}
  color: #ff6600;
  font-size: 18px;
  margin-bottom: 8px;
  letter-spacing: 1px;
`;

export const Title = styled.h2`
  ${heavyFont}
  color: var(--yellow-bar);
  font-size: 46px;
  margin-bottom: 10px;
  transform: scaleX(0.88);
  transform-origin: center;
`;

export const Text = styled.p`
  max-width: 900px;
  margin: 0 auto;
  color: #c7c7c7;
  font-family: Arial, sans-serif;
  font-size: 15px;
  line-height: 1.8;
`;

export const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  background: linear-gradient(180deg, rgba(255, 204, 0, 0.08) 0%, rgba(255, 85, 0, 0.06) 100%);
  border: 1px solid rgba(255, 204, 0, 0.18);
  border-radius: 10px;
  padding: 18px;
`;

export const CardNumber = styled.div`
  ${heavyFont}
  color: var(--yellow-bar);
  font-size: 34px;
  line-height: 1;
  margin-bottom: 8px;
`;

export const CardTitle = styled.h3`
  ${heavyFont}
  color: #fff;
  font-size: 24px;
  margin-bottom: 8px;
  transform: scaleX(0.9);
  transform-origin: left;
`;

export const CardText = styled.p`
  color: #d8d8d8;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.7;
`;

export const Strip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const StripItem = styled.div`
  background: #141418;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 14px;
  color: #f2f2f2;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
`;
