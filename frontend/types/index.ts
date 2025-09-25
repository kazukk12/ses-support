export interface Employee {
  id: number;
  name: string;
  years_experience: number;
  main_role: string;
  unit_price_min?: number;
  unit_price_max?: number;
  desired_career?: string;
  created_at: string;
  updated_at: string;
  skills: EmployeeSkill[];
  projects: Project[];
  availability?: Availability;
  one_on_ones: OneOnOne[];
}

export interface EmployeeList {
  id: number;
  name: string;
  years_experience: number;
  main_role: string;
  unit_price_min?: number;
  unit_price_max?: number;
  availability_status?: AvailabilityStatus;
  main_skills: string[];
}

export interface EmployeeSkill {
  skill_id: number;
  skill_name: string;
  skill_category: string;
  level: number;
  years_experience: number;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  created_at: string;
}

export interface Project {
  id: number;
  employee_id: number;
  title: string;
  role: string;
  start_date: string;
  end_date?: string;
  description?: string;
  tech_tags?: string;
  phase_requirements?: string;
  phase_design?: string;
  phase_implementation?: string;
  phase_testing?: string;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: number;
  employee_id: number;
  status: AvailabilityStatus;
  available_from?: string;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export interface OneOnOne {
  id: number;
  employee_id: number;
  date: string;
  memo?: string;
  status: OneOnOneStatus;
  created_at: string;
  updated_at: string;
}

export enum AvailabilityStatus {
  WORKING = "working",
  AVAILABLE_NEXT_MONTH = "available_next_month",
  IMMEDIATELY_AVAILABLE = "immediately_available"
}

export enum OneOnOneStatus {
  GOOD = "good",
  NORMAL = "normal",
  ATTENTION = "attention"
}

export interface DashboardStats {
  total_employees: number;
  next_month_available: number;
  one_on_one_completion_rate: number;
  attention_employees: number;
}

export interface SkillDistribution {
  category: string;
  count: number;
}

export interface ProjectMatchingRequest {
  required_skills: string[];
  preferred_skills?: string[];
  required_phases?: string[];
  start_date?: string;
  unit_price_min?: number;
  unit_price_max?: number;
}

export interface ProjectMatchingResult {
  employee: EmployeeList;
  score: number;
  matching_skills: string[];
  recent_projects: string[];
}