import React from "react";
import { Card, Button } from "react-bootstrap"; // Bootstrap components for Card and Button
import "./AvailableCourse.css"; // External CSS for custom styles
import fbise from "../../assets/imeages/AvailableCourse/fbise-logo.png"; // Importing image
import pctb from "../../assets/imeages/AvailableCourse/pctb-logo.png"; // Importing image
const AvailableCourses = () => {
  const courses = [
    {
      image: pctb, // Replace with actual image
      title: "PTB",
      description: "9th - 12th",
    },
    {
      image: fbise, // Replace with actual image
      title: "Fedral",
      description: "Comming Soon",
    },
  ];

  return (
    <section className="available-courses">
      <div className="container">
        <h2 className="courses-heading">Available Courses</h2>
        <div className="row fit-content">
          {courses.map((course, index) => (
            <div
              key={index}
              className="col-6 col-md-3 d-flex justify-content-center"
            >
              <Card className="course-card">
                <Card.Img variant="top" src={course.image} />
                <Card.Body>
                  <Card.Title>{course.title}</Card.Title>
                  <Card.Text>{course.description}</Card.Text>
                  <Button variant="primary">Enroll Now</Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableCourses;
