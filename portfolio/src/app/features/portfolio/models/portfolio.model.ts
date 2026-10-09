export interface MetricItem {
  id: string;
  value: string;
  labelKey: string;
}

export interface PillarItem {
  id: string;
  number: string;
  titleKey: string;
  descKey: string;
  tags: string[];
}

export interface SkillCategoryItem {
  id: string;
  titleKey: string;
  badgeKey: string;
  icon: string;
  skills: string[];
}

export interface ExperienceRoleItem {
  id: string;
  companyKey: string;
  locationKey: string;
  roleKey: string;
  periodKey: string;
  descriptionKey: string;
  techKey: string;
  tag?: string;
}

export interface ProjectItem {
  id: string;
  titleKey: string;
  descKey: string;
  stackKey: string;
  githubUrl: string;
  liveUrl?: string;
  badge?: string;
}

export interface EducationItem {
  id: string;
  degreeKey: string;
  institutionKey: string;
  yearKey: string;
  badgeKey?: string;
}

export interface LanguageItem {
  id: string;
  langKey: string;
  levelKey: string;
}
