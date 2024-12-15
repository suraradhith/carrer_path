// App.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card, Row, Col, ListGroup, Badge, ProgressBar } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [profile, setProfile] = useState({ skills: '', interests: '', academic_performance: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/analyze_profile', {
        skills: profile.skills.split(',').map(skill => skill.trim()),
        interests: profile.interests.split(',').map(interest => interest.trim()),
        academic_performance: parseFloat(profile.academic_performance)
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while analyzing your profile. Please try again.');
    }
    setLoading(false);
  };

  const renderAnalysis = () => {
    if (!results) return null;

    const careerData = results.recommended_careers.map((career, index) => ({
      name: career,
      salary: results.predicted_salary,
      growth: results.job_growth
    }));

    return (
      <div className="analysis-results">
        <h2 className="text-center mb-4">Your Career Analysis</h2>
        <Row>
          <Col lg={6}>
            <Card className="mb-4 shadow">
              <Card.Body>
                <Card.Title className="text-primary">Top Career Recommendations</Card.Title>
                <ListGroup variant="flush">
                  {results.recommended_careers.map((career, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      {career}
                      <Badge bg="primary" pill>{index + 1}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="mb-4 shadow">
              <Card.Body>
                <Card.Title className="text-success">Salary Projection</Card.Title>
                <h3>${results.predicted_salary.toLocaleString()}</h3>
                <Card.Text>Estimated annual salary for your top recommendation</Card.Text>
                <ProgressBar now={results.predicted_salary / 1500} label={`$${results.predicted_salary.toLocaleString()}`} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <Card className="mb-4 shadow">
              <Card.Body>
                <Card.Title className="text-warning">Skills to Develop</Card.Title>
                <ListGroup variant="flush">
                  {results.skill_gaps.map((skill, index) => (
                    <ListGroup.Item key={index}>
                      <i className="fas fa-arrow-right me-2"></i>{skill}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="mb-4 shadow">
              <Card.Body>
                <Card.Title className="text-info">Job Market Outlook</Card.Title>
                <h3>{results.job_growth}%</h3>
                <Card.Text>Projected job growth rate</Card.Text>
                <ProgressBar now={results.job_growth} label={`${results.job_growth}%`} variant="info" />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {results.industry_trend && (
          <Card className="mb-4 shadow">
            <Card.Body>
              <Card.Title className="text-secondary">Industry Trend</Card.Title>
              <h4>{results.industry_trend.industry}</h4>
              <p><strong>Trend:</strong> {results.industry_trend.trend}</p>
              <p><strong>Impact:</strong> {results.industry_trend.impact}/10</p>
              <ProgressBar now={results.industry_trend.impact * 10} label={`Impact: ${results.industry_trend.impact}/10`} variant="secondary" />
            </Card.Body>
          </Card>
        )}
        <Card className="shadow">
          <Card.Body>
            <Card.Title className="text-primary">Career Comparison</Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={careerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="salary" fill="#8884d8" name="Salary ($)" />
                <Bar yAxisId="right" dataKey="growth" fill="#82ca9d" name="Job Growth (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </div>
    );
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-5">Career Path and Skill Mapping Platform</h1>
      <Card className="shadow-sm mb-5">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Skills (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                placeholder="e.g., python, data analysis, communication"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Interests (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={profile.interests}
                onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                placeholder="e.g., technology, finance, healthcare"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Academic Performance (GPA)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                value={profile.academic_performance}
                onChange={(e) => setProfile({ ...profile, academic_performance: e.target.value })}
                placeholder="Enter your GPA (e.g., 3.5)"
              />
            </Form.Group>
            <Button variant="primary" type="submit" size="lg" className="w-100" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Profile'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {renderAnalysis()}
    </Container>
  );
}

export default App;