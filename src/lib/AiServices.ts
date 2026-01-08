import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ResumeData = {
  skills: string[];
  experience_years: number;
  education_level: string;
  recent_role: string;
};

export type ResumeAnalysisResult = {
  isValid: boolean;
  validationReason?: string;
  data?: ResumeData;
};


export type JobData = {
  must_have_skills: string[];
  nice_to_have_skills: string[];
  min_years_experience: number;
  role_seniority: string;
};

export type JobAnalysisResult = {
  isValid: boolean;
  validationReason?: string;
  data?: JobData;
};

export type LearningResource = {
  title: string;       // e.g., "React JS Crash Course"
  type: 'video' | 'course' | 'documentation' | 'article'; 
  platform: string;    // e.g., "YouTube", "Udemy", "Official Docs", "Medium"
  author?: string;     // e.g., "Traversy Media", "Meta"
};

export type ProjectSuggestion = {
  title: string;
  description: string;
  key_features: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tech_stack: string[]; 
  real_world_use_case: string; 
};

export type LearningPath = {
  missing_skills: {
    skill: string;
    description: string;
    resources: LearningResource[];
  }[];
  project_suggestion: ProjectSuggestion;
  estimated_time_weeks: number;
};


export async function parseResume(resumeText: string): Promise<ResumeAnalysisResult> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { 
        role: "system", 
        content: `You are an expert HR Resume Parser and Gatekeeper.
        
        Your Task:
        1. First, ANALYZE the input text to determine if it is a legitimate professional Resume/CV.
           - REJECT if it is: A cooking recipe, song lyrics, code snippet, random gibberish, too short (under 10 words), or clearly not a professional profile.
           
        2. Output a JSON object based on your analysis:
        
        IF NOT A RESUME:
        {
          "isValid": false,
          "validationReason": "A short, polite explanation of why this text was rejected (e.g., 'This appears to be a recipe, not a resume').",
          "data": null
        }

        IF IT IS A RESUME:
        {
          "isValid": true,
          "validationReason": null,
          "data": {
            "skills": ["Array", "of", "skills"],
            "experience_years": number (total years estimated),
            "education_level": "string (e.g., Bachelor's, Self-taught, PhD)",
            "recent_role": "string"
          }
        }` 
      },
      { role: "user", content: resumeText }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(completion.choices[0].message.content!);
}

export async function parseJobDescription(jobText: string): Promise<JobAnalysisResult> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { 
        role: "system", 
        content: `You are an expert HR Job Description Parser and Gatekeeper.
        
        Your Task:
        1. First, ANALYZE the input text to determine if it is a legitimate Job Description or vacancy announcement.
           - REJECT if it is: A cooking recipe, political rant, code snippet, random gibberish, too short, or clearly not a job offer.
           
        2. Output a JSON object:

        IF NOT A JOB DESCRIPTION:
        {
          "isValid": false,
          "validationReason": "Explain why this text was rejected (e.g., 'This text describes how to bake a cake, not a job vacancy').",
          "data": null
        }

        IF IT IS A JOB DESCRIPTION:
        {
          "isValid": true,
          "validationReason": null,
          "data": {
            "must_have_skills": ["Array", "of", "crucial", "skills"],
            "nice_to_have_skills": ["Array", "of", "bonus", "skills"],
            "min_years_experience": number (default to 0 if not specified),
            "role_seniority": "string (Junior, Mid, Senior, Lead, etc.)"
          }
        }` 
      },
      { role: "user", content: jobText }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(completion.choices[0].message.content!);
}

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

export async function generateLearningPath(
  missingKeywords: string[], 
  jobTitle: string,
  jobDescription: string
): Promise<LearningPath> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { 
        role: "system", 
        content: `You are a Senior Technical Career Mentor.
        
        GOAL: Create a bridge between the user's current skills and the target job.
        
        PART 1: RESOURCES
        For each missing skill, provide specific, high-quality learning resources.
        - Prioritize free, official docs, or highly reputable YouTube channels (e.g., Traversy Media, Net Ninja, FreeCodeCamp).
        
        PART 2: CAPSTONE PROJECT (CRITICAL)
        Suggest ONE comprehensive "Portfolio-Ready" project.
        - The project MUST combine multiple "missing skills" into a single application.
        - It should be complex enough to impress an interviewer.
        - Explicitly list the Tech Stack required.
        
        Output JSON format strictly:
        {
          "missing_skills": [
            { 
              "skill": "React", 
              "description": "Why it matters.", 
              "resources": [
                { "title": "...", "type": "video", "platform": "...", "author": "..." }
              ] 
            }
          ],
          "project_suggestion": {
            "title": "Name of the app",
            "description": "A compelling description of what the app does.",
            "difficulty": "Intermediate",
            "tech_stack": ["React", "TheMissingSkill1", "TheMissingSkill2"],
            "key_features": ["User Auth", "Real-time updates", "Dashboard"],
            "real_world_use_case": "Demonstrates ability to handle state management and API integration."
          },
          "estimated_time_weeks": number
        }` 
      },
      { 
        role: "user", 
        content: `Target Job: ${jobTitle}
        Job Desc Snippet: ${jobDescription.substring(0, 500)}...
        Missing Skills to learn: ${JSON.stringify(missingKeywords)}` 
      }
    ],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(completion.choices[0].message.content!);
}