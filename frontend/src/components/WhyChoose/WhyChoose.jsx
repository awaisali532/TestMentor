import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { BsCpu, BsJournalText, BsGraphUp, BsPhone } from "react-icons/bs";
import "./WhyChoose.css";

const features = [
  {
    icon: <BsCpu />,
    title: "AI-Powered Study Tools",
    description:
      "Automatic paper generation and real-time answers using AI to make learning faster and smarter.",
  },
  {
    icon: <BsJournalText />,
    title: "Board-Wise Content",
    description:
      "Tailored study material for major boards like FBISE and PCTB, so you only see what’s relevant.",
  },
  {
    icon: <BsGraphUp />,
    title: "Smart Test Preparation",
    description:
      "Practice quizzes, mock exams, and performance tracking to boost your confidence before exams.",
  },
  {
    icon: <BsPhone />,
    title: "User-Friendly Design",
    description:
      "Clean, mobile-friendly interface that's easy for every student to use without any confusion.",
  },
];

const WhyChoose = () => {
  return (
    <section className="why-choose d-flex justify-content-center">
      <Container>
        <h2 className="section-title">Why Choose TestMentor?</h2>
        <Row>
          {features.map((feature, index) => (
            <Col
              key={index}
              md={6}
              className="d-flex align-items-start feature-wrapper"
            >
              <div className="icon-container">{feature.icon}</div>
              <div>
                <h5 className="feature-title">{feature.title}</h5>
                <p className="feature-description">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default WhyChoose;
