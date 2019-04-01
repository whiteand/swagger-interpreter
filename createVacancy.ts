// IMPORTS PART--------------------------------------------------
import axios from 'axios'
import quartet from 'quartet'
const v = quartet()

// TYPE DEFINITIONS PART-----------------------------------------
type CreateVacancyPayloadRequirement = {
  skillId: (string | null)
  minimumSkillLevel: number
  isOptional: boolean
  readyToCompromise: boolean
}

enum EmploymentType {
  PartTime = "PartTime",
  FullTime = "FullTime",
  Any = "Any"
}

enum Relocation {
  No = "No",
  InsideCountry = "InsideCountry",
  AnotherCountry = "AnotherCountry",
  Anywhere = "Anywhere"
}

enum RemoteWork {
  No = "No",
  Yes = "Yes"
}

enum Stages {
  PhoneInterview = "PhoneInterview",
  TechnicalInterview = "TechnicalInterview",
  HrInterview = "HrInterview",
  ManagerInterview = "ManagerInterview",
  JobOffer = "JobOffer"
}

enum Priority {
  Urgent = "Urgent",
  Important = "Important"
}

type CreateVacancyPayload = {
  officeId: (string | null)
  specializationId: (string | null)
  description: (string | null)
  position: (string | null)
  priority: Priority[]
  stages: Stages[]
  remoteWork: RemoteWork[]
  relocation: Relocation[]
  employmentType: EmploymentType[]
  salary: number
  teamLeadSkillLLevel: number
  englishSkillLevel: number
  requirements: CreateVacancyPayloadRequirement[]
  Authorization: (string | null)
}

const checkStringListOfValues = (constants, separator = ",") => value =>
  typeof value === "string" &&
  value
    .split(separator)
    .every(enumValue => Object.values(constants).includes(enumValue));

const checkPayload = v({
  "officeId": ["string", "null"],
  "specializationId": ["string", "null"],
  "description": ["string", "null"],
  "position": ["string", "null"],
  "priority": checkStringListOfValues(Response),
  "stages": checkStringListOfValues(Response),
  "remoteWork": checkStringListOfValues(Response),
  "relocation": checkStringListOfValues(Response),
  "employmentType": checkStringListOfValues(Response),
  "salary": "finite",
  "teamLeadSkillLLevel": "safe-integer",
  "englishSkillLevel": "safe-integer",
  "requirements": v.arrayOf({
    "skillId": ["string", "null"],
    "minimumSkillLevel": "safe-integer",
    "isOptional": "boolean",
    "readyToCompromise": "boolean"
  }),
  "Authorization": ["string", "null"]
})

// FUNCTION PART-------------------------------------------------
// url: /api/recruiter/vacancies, method: post
export async function createVacancy(payload: CreateVacancyPayload): Promise<void> {
  v.clearContext()
  if (!checkPayload(payload)) {
    console.debug(v.explanation)
    throw new TypeError("Wrong createVacancy payload")
  }
  
  const URL = "/api/recruiter/vacancies"
  const { officeId, specializationId, description, position, priority, stages, remoteWork, relocation, employmentType, salary, teamLeadSkillLLevel, englishSkillLevel, requirements, Authorization } = payload
  await axios.post(
    URL,
    { officeId, specializationId, description, position, priority, stages, remoteWork, relocation, employmentType, salary, teamLeadSkillLLevel, englishSkillLevel, requirements },
    { headers: { Authorization } }
  )
}