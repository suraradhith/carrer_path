import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load and preprocess data
skills_data = pd.read_csv("skills_data.csv")
career_data = pd.read_csv("career_data.csv")
industry_trends = pd.read_csv("industry_trends.csv")

# Ensure skills_data and career_data have the same number of samples
assert len(skills_data) == len(career_data), "Mismatch in number of samples between skills_data and career_data"

# Prepare data for models
vectorizer = TfidfVectorizer()
X_skills = vectorizer.fit_transform(skills_data['skills'])
y_careers = career_data['career']
y_salaries = career_data['average_salary']

# Train models
career_model = RandomForestClassifier(n_estimators=100, random_state=42)
career_model.fit(X_skills, y_careers)

salary_model = RandomForestRegressor(n_estimators=100, random_state=42)
salary_model.fit(X_skills, y_salaries)

class UserProfile(BaseModel):
    skills: list[str]
    interests: list[str]
    academic_performance: float

@app.post("/analyze_profile")
async def analyze_profile(profile: UserProfile):
    user_skills = vectorizer.transform([" ".join(profile.skills)])
    
    # Career recommendation
    career_probabilities = career_model.predict_proba(user_skills)[0]
    top_careers_indices = career_probabilities.argsort()[-3:][::-1]
    top_careers = career_model.classes_[top_careers_indices]
    
    # Salary prediction
    predicted_salary = salary_model.predict(user_skills)[0]
    
    # Skill gap analysis
    top_career = top_careers[0]
    required_skills = set(career_data[career_data['career'] == top_career]['required_skills'].iloc[0].split(','))
    user_skills_set = set(profile.skills)
    skill_gaps = list(required_skills - user_skills_set)
    
    # Job growth projection
    job_growth = career_data[career_data['career'] == top_career]['job_growth'].iloc[0]
    
    # Industry trends
    related_industry = career_data[career_data['career'] == top_career]['industry'].iloc[0]
    industry_trend = industry_trends[industry_trends['industry'] == related_industry].to_dict('records')[0]
    
    response = {
        "recommended_careers": top_careers.tolist(),
        "predicted_salary": round(float(predicted_salary), 2),
        "skill_gaps": skill_gaps,
        "job_growth": float(job_growth),
        "industry_trend": industry_trend
    }
    
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)