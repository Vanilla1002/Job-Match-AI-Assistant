import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type PersonalDetails = {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  location?: string;
};

export type Project = {
  name: string;
  description: string; // Brief one-liner or tech stack summary if needed
  url?: string; // GitHub link or live demo
  tech_stack: string[]; // Specific skills used in this project
  details: string[]; // Bullet points
};

export type ResumeData = {
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    other: string[]; // Fallback category
  }; // Changed from string[] to categorized object for better formatting
  experience_years: number;
  education_level: string;
  recent_role: string;
  summary?: string;
  experience?: Array<{
    company: string;
    role: string;
    dates: string;
    description: string[];
  }>;
  projects?: Project[]; // Added distinct Projects array
  education?: Array<{
    institution: string;
    degree: string;
    dates: string;
    details?: string; // Added for coursework etc.
  }>;
};


export type ResumeAnalysisResult = {
  isValid: boolean;
  validationReason?: string;
  data?: ResumeData;
  personal_details?: PersonalDetails; 
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
  title: string;
  type: 'video' | 'course' | 'documentation' | 'article'; 
  platform: string;
  author?: string;
  url: string; 
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
        content: `You are an expert HR & Technical Resume Parser.

        Your Task:
        1. **VALIDATION:** Analyze the input to determine if it is a legitimate professional Resume/CV.
           - REJECT if it is: A cooking recipe, song lyrics, code snippet, random gibberish, too short, or clearly not a professional profile.

        2. **EXTRACTION (If Valid):** Extract data into a structured format.
           - **CRITICAL RULE:** STRICTLY separate "Work Experience" (paid jobs, employment) from "Projects" (GitHub, Personal, Capstone, Hackathons).
           - **SKILLS:** Categorize skills intelligently into Languages, Frameworks, Tools, and Other.

        3. **LINK HANDLING STRATEGY (CRITICAL):**
           - The input text often contains lists of links at the bottom of pages labeled as "[LINKS FOUND ON PAGE X]".
           - You MUST cross-reference these links with the projects or content mentioned on that specific page.
           - If a project is described in the text, look for a matching URL in the "[LINKS FOUND...]" section of that page (e.g., by matching GitHub repository names to project titles).
           - Assign the URL to the specific project object if a match is found.

        Output JSON format:

        --- SCENARIO 1: NOT A RESUME ---
        {
          "isValid": false,
          "validationReason": "Short explanation of rejection (e.g., 'This is a cooking recipe')",
          "personal_details": null,
          "data": null
        }

        --- SCENARIO 2: VALID RESUME ---
        {
          "isValid": true,
          "validationReason": null,
          "personal_details": {
            "name": "string",
            "email": "string",
            "phone": "string",
            "linkedin": "string",
            "github": "string",
            "location": "string"
          },
          "data": {
            "summary": "Professional summary text",
            "experience_years": number,
            "education_level": "string",
            "recent_role": "string",
            "skills": {
              "languages": ["Java", "Python", ...],
              "frameworks": ["React", "Spring", ...],
              "tools": ["Git", "Docker", ...],
              "other": []
            },
            "experience": [
              {
                "company": "Company Name",
                "role": "Job Title",
                "dates": "Date Range",
                "description": ["Action result bullet 1", "Action result bullet 2"]
              }
            ],
            "projects": [
              {
                "name": "Project Name",
                "description": "Short description",
                "url": "Link if present (Look for matches in the footer links sections)",
                "tech_stack": ["React", "Node.js"],
                "details": ["Bullet point 1", "Bullet point 2"]
              }
            ],
            "education": [
              {
                "institution": "University/School",
                "degree": "Degree Name",
                "dates": "Dates",
                "details": "Relevant coursework or honors"
              }
            ]
          }
        }`
      },
      { role: "user", content: resumeText }
    ],
    response_format: { type: "json_object" }
  });
  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to get content from OpenAI");
  }

  return JSON.parse(completion.choices[0].message.content!) as ResumeAnalysisResult;
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
        
        PART 1: RESOURCES (STRICT)
        For each missing skill, provide specific, high-quality learning resources.
        - **CRITICAL REQUIREMENT:** You MUST provide ACTUAL, DIRECT URLs to the content.
        - For Documentation: Link directly to official docs (e.g., "https://react.dev/learn", not just "react.dev").
        - For Videos: Link to a specific, high-quality YouTube video or Playlist.
        - Do NOT provide generic search URLs like "google.com" or "youtube.com".
        - Prioritize free, official docs, or highly reputable creators (e.g., Traversy Media, Net Ninja, FreeCodeCamp).
        
        PART 2: CAPSTONE PROJECT (CRITICAL)
        Suggest ONE comprehensive "Portfolio-Ready" project.
        - The project MUST combine multiple "missing skills" into a single application.
        - It should be complex enough to impress an interviewer.
        - Explicitly list the Tech Stack required.
        - Explain the "Real World Use Case" to help the candidate sell it in an interview.
        
        Output JSON format strictly:
        {
          "missing_skills": [
            { 
              "skill": "React", 
              "description": "Why it matters.", 
              "resources": [
                { 
                  "title": "React Official Tutorial", 
                  "type": "documentation", 
                  "platform": "React Docs", 
                  "author": "Meta", 
                  "url": "https://react.dev/learn"
                }
              ] 
            }
          ],
          "project_suggestion": {
            "title": "Name of the app",
            "description": "A compelling description of what the app does.",
            "difficulty": "Intermediate", // or Beginner/Advanced
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

export async function generateTailoredResume(
  currentResumeText: string,
  jobDescription: string,
  missingSkills: string[]
): Promise<{ personal_details: PersonalDetails; content: ResumeData }> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert Talent Acquisition Specialist and Technical Resume Strategist that knows perfectly how ATS works.

        GOAL: Re-engineer the candidate's resume to strictly target the "Target Job".

        MINDSET:
        Adopt the perspective of a Recruiter looking for **High Potential**. You are not just matching keywords; you are reframing existing experience to prove the capacity to succeed in this role.

        CRITICAL INSTRUCTIONS:
        1. **Strict Structure:** Do NOT move "Projects" (personal/github) into "Experience" (employment). Keep them separate.
        2. **Highlight Potential & Transferable Skills:** Rewrite the "Summary" and experience bullets. Focus on problem-solving and adaptability.
        3. **EDUCATION INTEGRITY & FORMAT:** - **MANDATORY:** You MUST extract and include ALL education entries found in the "Original Resume".
           - **Partial Degrees:** Even if the degree is partial (e.g., "1/3 of a degree") or High School, YOU MUST INCLUDE IT. Do not filter it out.
           - **Schema:** You MUST use the exact keys: "institution", "degree", "dates", and "details".
        4. **Gap Bridging:** If the candidate lacks direct experience, emphasize related projects or parallel skills that demonstrate the ability to close the gap.
        5. **Refine Bullets:** Use strong action verbs and metrics where possible.
        6. **Missing Skills Integration:** Add provided "Missing Skills" ONLY if plausible. If a skill was used in a project, explicitly mention it in the project's 'tech_stack'.
        7. **Integrity:** DO NOT invent companies, degrees, or timeframes.
        8. **Links:** IF the original resume had a URL for a project, YOU MUST PRESERVE IT in the output.

        OUTPUT JSON Structure (Strict):
        {
          "personal_details": { 
             "name": "String",
             "email": "String",
             "phone": "String",
             "location": "String",
             "linkedin": "String (URL)",
             "github": "String (URL)"
          },
          "content": {
            "summary": "A persuasive summary bridging past to future...",
            "skills": {
               "languages": ["String"],
               "frameworks": ["String"],
               "tools": ["String"],
               "other": ["String"]
            },
            "experience": [
              {
                "company": "String",
                "role": "String",
                "dates": "String",
                "description": ["Action-oriented bullet", "Bullet highlighting potential"]
              }
            ],
            "projects": [
              {
                "name": "String",
                "url": "String (or null)", 
                "description": "String",
                "tech_stack": ["String"],
                "details": ["String"]
              }
            ],
            // CRITICAL: Use this EXACT structure for education
            "education": [ 
              {
                "institution": "String (Name of University/School)",
                "degree": "String (Name of Degree/Diploma)",
                "dates": "String (e.g., 2018-2023)",
                "details": "String (Optional details like coursework)"
              }
            ]
          }
        }`
      },
      {
        role: "user",
        content: `Original Resume: ${currentResumeText}
        Target Job: ${jobDescription}
        Missing Skills to Add: ${JSON.stringify(missingSkills)}`
      }
    ],
    response_format: { type: "json_object" }
  });

  const responseContent = completion.choices[0].message.content;
  if (!responseContent) throw new Error("Failed to generate resume JSON");

  return JSON.parse(responseContent);
}