import styled from "styled-components";
import { heavyFont } from "../shared/mixins";

export const Section = styled.section`
  margin-top: 30px;
`;

export const InfoBar = styled.div`
  background: var(--yellow-bar);
  border-radius: 6px;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin-bottom: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  flex-wrap: wrap;
`;

export const InfoItem = styled.div`
  color: #000;
  font-size: 16px;
  font-weight: 900;
  font-family: Arial, sans-serif;
  text-align: center;
  line-height: 1.3;
`;

export const InfoLabel = styled.span`
  display: block;
  font-size: 11px;
  letter-spacing: 1.5px;
  opacity: 0.55;
  margin-bottom: 1px;
`;

export const InfoSep = styled.div`
  color: rgba(0, 0, 0, 0.25);
  font-size: 28px;
  font-weight: 100;
`;

export const StepsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const StepCard = styled.div`
  background: rgba(255, 204, 0, 0.06);
  border: 1px solid rgba(255, 204, 0, 0.18);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const StepNumber = styled.div`
  ${heavyFont}
  color: var(--yellow-bar);
  font-size: 28px;
  line-height: 1;
`;

export const StepBody = styled.div`
  font-family: Arial, sans-serif;
  color: #ddd;
  font-size: 14px;
  line-height: 1.55;
`;

export const StepTitle = styled.div`
  ${heavyFont}
  color: #fff;
  font-size: 18px;
  margin-bottom: 4px;
`;

export const Heading = styled.h2`
  ${heavyFont}
  text-align: center;
  color: var(--yellow-bar);
  font-size: 46px;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-shadow: 0 0 30px rgba(255, 204, 0, 0.3);
  transform: scaleX(0.88);
  transform-origin: center;
  line-height: 1;
`;

export const Subtext = styled.p`
  text-align: center;
  color: #bbb;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 22px;
`;

export const EmptyState = styled.div`
  border: 1px solid rgba(255, 102, 0, 0.22);
  background: rgba(255, 102, 0, 0.08);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 18px;
  color: #ffd0bf;
  font-family: Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
