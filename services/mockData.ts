import { Teacher, Student, Discipline, User } from '../types';

export const currentUser: User = {
  name: "Roberto Almeida",
  role: "Coordenador (Paeet)",
  email: "coord@paeet.edu.br",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1I_Hf98tEyDMmX1iB0tKXSMB0s5KWMvdKe7B5W-p5n7cm6GoafwNn6gllAogoDN1RDO8-YRH1WEjJ985n7DY4rq6XYhI24a-TKnTyFHVmp24mxvY5C2FIhnoq1g6aa3dMQggvy9mpkC7_65uV2532fWnJE2hGRhp8wJrXjiwq4MgSpkmJQ06_YdUGq9TIf2luanabx6SrTVATiv4iEjYeiZG-xu2Aw3ww_aZDtu8_L_7MNX-nLAmeQWJP4YlBvPzV4kkJMBLMJhg"
};

export const mockTeachers: Teacher[] = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana.silva@etec.sp.gov.br",
    phone: "(11) 98765-4321",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuASvaMsrjysEbrvfEg2c8Z02xFnujYa_IsJd_x1zGzUkZm43Y8bEHjLi3YOddCnevteVl1t55Z5uNILCrSq4FLb6Jg1L7hSd_RKaFKiZlQYCQ8FdewqB0A4H9nA7jEb1qTOSifpV61r02y-Jt2lXqSGDorHwFhBGejSpvIp8_VgbeWLeFJaG9cHl3tj1a_wgrY0-5jtibZCNcYgU4u2kYPSi7w-OP4D3CoKXeDGQDYUXQ-MjgLHmyvsjDrNC2fXLVX-LXe20lWUhh0",
    specializations: ["Java", "Banco de Dados"],
    maxHours: 20,
    currentHours: 12
  },
  {
    id: 2,
    name: "Carlos Oliveira",
    email: "carlos.o@etec.sp.gov.br",
    phone: "(11) 91234-5678",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM_yNPnWFb3haLv5xeTDQR_5a4PpdOizB7fA6Jzv1hOzqUvgO8bNHXjuhwL-mthJWrSC4FXuk3Ql63kfFvgrt-uXwBFrOMi_n2BRyBLJdOZYBmL3F5ihW0RHcrIaZg2fdKiXZ95GceJIu7n73DjlW8LzWzS0AbXqFVid6Jox8ck_gZlGvOIrMRUsil0w7ZxmWboLpzvLKKSyQL0FJrRtfIgyihdr-JCiw_j571Yymbg8zw_xS7D1-kmCXKcUOkdFd0X8hjbCOxJng",
    specializations: ["Web", "Design"],
    maxHours: 40,
    currentHours: 4
  },
  {
    id: 3,
    name: "Maria Rita",
    email: "maria.r@etec.sp.gov.br",
    phone: "(11) 99887-7766",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqSvR-O3fD8CpBoaZWIAhfygkloV_KQuO3jgVGtipz6OKuP8cY_4D_79jO4uQ7Z6ad7G2N9If9KcSENt3okiXEkIdZtoKvAmU5BpazUMYe3rniMo8oQ514IDeaRe-cUt7QJfBcUj1EqfYMo0ii1aTQnLPsH6yFlT0qyGfqrso-fE5KouFAahnJ_AhVfPf_VkldknpV_o6K-cUdwBbixRkVvA63nIAINlDdAe2ulZpYAosI71h7X0lC0-q16v9CsmT531NdnAw55KM",
    specializations: ["Redes", "Infra"],
    maxHours: 20,
    currentHours: 22
  },
  {
    id: 4,
    name: "João Paulo",
    email: "joao.p@etec.sp.gov.br",
    phone: "(11) 95544-3322",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLSkWe_RO0_tD9kM4XbjeveVovNeYor-zE2-zGRBTlJQwgeMKYRb8j7zcsLMkgpc2PPfYUglskTIZjf1VoZo2ySSwY_ppog-18mbbVF5yVfBB0t3Ml5UpWA8rWObLgJutZS5MMmOdJzN7XF6hQeglxhpVF0hSc87gyYuQxMhv8KPmyRXqriDTYtDXQwWHSyLASrc78c2clFqOZcJU54ufocRIFa7axKtG4WgkIoI24xiNvyVGxJVY0As5rtePT9cHkk5RnBgCnNbI",
    specializations: ["Python", "Algoritmos"],
    maxHours: 20,
    currentHours: 0
  }
];

export const mockStudents: Student[] = [
  { id: 1, registration: "2023058", name: "Ana Souza", email: "ana.souza@etec.sp.gov.br", course: "Des. Sistemas", classGroup: "2º Mod A", avatar: "AS" },
  { id: 2, registration: "2023102", name: "Carlos Mendes", email: "carlos.mendes@etec.sp.gov.br", course: "Administração", classGroup: "1º Mod B", avatar: "CM" },
  { id: 3, registration: "2023044", name: "Fernanda Lima", email: "fernanda.lima@etec.sp.gov.br", course: "Des. Sistemas", classGroup: "3º Mod A", avatar: "FL" },
  { id: 4, registration: "2023150", name: "Jorge Oliveira", email: "jorge.o@etec.sp.gov.br", course: "Des. Sistemas", classGroup: "1º Mod A", avatar: "JO" },
  { id: 5, registration: "2023198", name: "Maria Luiza", email: "maria.luiza@etec.sp.gov.br", course: "Enfermagem", classGroup: "2º Mod C", avatar: "ML" }
];

export const mockDisciplines: Discipline[] = [
  { id: 1024, code: "LPA-101", name: "Lógica de Programação", course: "ds", module: "Módulo 1 - Fundamentos", hours: 80, description: "Fundamentos essenciais de algoritmos.", period: "Matutino", assignedTeacherId: 1 },
  { id: 1025, code: "SO-102", name: "Sistemas Operacionais", course: "ds", module: "Módulo 1 - Fundamentos", hours: 40, description: "Gerenciamento de recursos e processos.", period: "Matutino", assignedTeacherId: null },
  { id: 2001, code: "FEND-201", name: "Front-End I (HTML/CSS)", course: "ds", module: "Módulo 2 - Desenvolvimento Web", hours: 60, description: "Estruturação e estilização web.", period: "Vespertino", assignedTeacherId: 2 },
  { id: 2002, code: "JS-202", name: "JavaScript Básico", course: "ds", module: "Módulo 2 - Desenvolvimento Web", hours: 60, description: "Interatividade client-side.", period: "Vespertino", assignedTeacherId: null },
];
