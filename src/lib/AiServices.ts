import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Type definitions for structured data ---

export type ResumeData = {
  skills: string[];
  experience_years: number;
  education_level: string;
  recent_role: string;
};

export type JobData = {
  must_have_skills: string[];
  nice_to_have_skills: string[];
  min_years_experience: number;
  role_seniority: string;
};

// --- Helper functions (Separate prompts) ---

// Step 1: Resume analysis
export async function parseResume(resumeText: string): Promise<ResumeData> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Extract structured data from the resume. Return JSON with: skills (array), experience_years (number, total), education_level (string), recent_role (string)." },
      { role: "user", content: resumeText }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(completion.choices[0].message.content!);
}

// Step 2: Job analysis (Separate must-have from nice-to-have)
export async function parseJobDescription(jobText: string): Promise<JobData> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Extract job requirements. Crucial: Separate 'Must Have' from 'Nice to Have'. Return JSON with: must_have_skills (array), nice_to_have_skills (array), min_years_experience (number), role_seniority (string)." },
      { role: "user", content: jobText }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(completion.choices[0].message.content!);
}

// Step 3: Core - Comparison and calculation
export async function analyzeMatch(resumeData: ResumeData, jobData: JobData) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { 
        role: "system", 
        content: `You are a strict Logic Matcher Algorithm. 
        Compare the Resume Data vs Job Data carefully.
        
        Scoring Rules:
        - Missing a "Must Have" skill is a huge penalty.
        - Missing a "Nice to Have" is a small penalty.
        - Experience gap is a medium penalty.
        
        Output JSON:
        {
          "match_percentage": number (0-100),
          "gap_analysis": {
            "critical_missing_skills": [],
            "bonus_missing_skills": [],
            "experience_match": "string (e.g., 'Matches', 'Too junior', 'Overqualified')"
          },
          "detailed_feedback": "A professional paragraph explaining the score.",
          "learning_focus": "A list of 3-5 specific topics the user needs to learn for Step 4."
        }` 
      },
      { 
        role: "user", 
        content: `Resume Data: ${JSON.stringify(resumeData)}\n\nJob Data: ${JSON.stringify(jobData)}` 
      }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(completion.choices[0].message.content!);
}