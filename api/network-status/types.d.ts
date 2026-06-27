interface DNSResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: QuestionRecord[];
  Answer: AnswerRecord[];
  Authority: AuthorityRecord[];
}

interface AnswerRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface QuestionRecord {
  name: string;
  type: number;
}

interface AuthorityRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}
