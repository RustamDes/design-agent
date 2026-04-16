export type Skill = { id: string; title: string; desc: string; trigger: string }
export type Stage = { id: string; slug: string; name: string; desc: string; skills: Skill[] }
export type Project = {
  id: string
  title: string
  desc: string
  context?: string
  createdAt: string
  currentStage: string
}

export const STAGES: Stage[] = [
  {
    id: '1', slug: 'discovery', name: 'Discovery',
    desc: 'Исследование, анализ конкурентов, постановка проблемы',
    skills: [
      { id: 'S1', title: 'Разобрать задачу', desc: 'Структурирую known/unknown из брифа', trigger: 'Запусти S1.' },
      { id: 'S2', title: 'Синтез интервью', desc: 'Из транскрипта — структурированный отчёт', trigger: 'Запусти S2.' },
      { id: 'S3', title: 'Анализ конкурентов', desc: 'Сравнительная таблица по критериям', trigger: 'Запусти S3.' },
      { id: 'S4', title: 'Сформулировать проблему', desc: 'Problem Statement по шаблону', trigger: 'Запусти S4.' },
      { id: 'S5', title: 'Найти пробелы', desc: 'Что неизвестно и что блокирует дизайн', trigger: 'Запусти S5.' },
      { id: 'S6', title: 'Вопросы для PM', desc: 'Список уточняющих вопросов', trigger: 'Запусти S6.' },
      { id: 'S7', title: 'Готова ли к дизайну', desc: 'Чеклист из 8 критериев с вердиктом', trigger: 'Запусти S7.' },
    ],
  },
  {
    id: '2', slug: 'design', name: 'Design',
    desc: 'User flow, edge cases, accessibility',
    skills: [
      { id: 'D1', title: 'Построить user flow', desc: 'Шаги пользователя от входа до цели', trigger: 'Запусти D1.' },
      { id: 'D2', title: 'Найти edge cases', desc: 'Граничные состояния и ошибки', trigger: 'Запусти D2.' },
      { id: 'D3', title: 'Проверить accessibility', desc: 'WCAG и инклюзивность', trigger: 'Запусти D3.' },
      { id: 'D4', title: 'Описать as-is', desc: 'Текущее состояние интерфейса', trigger: 'Запусти D4.' },
      { id: 'D5', title: 'Сформулировать гипотезы', desc: 'Гипотезы решения для тестирования', trigger: 'Запусти D5.' },
      { id: 'D6', title: 'Описать пользователя', desc: 'Персона или профиль сегмента', trigger: 'Запусти D6.' },
      { id: 'D7', title: 'Предложить метрики', desc: 'Как измерить успех дизайна', trigger: 'Запусти D7.' },
    ],
  },
  {
    id: '3', slug: 'review', name: 'Design Review',
    desc: 'Проверка дизайн-системы, UX-ревью, фидбек',
    skills: [
      { id: 'R1', title: 'Проверить дизайн-систему', desc: 'Соответствие компонентов и стилей', trigger: 'Запусти R1.' },
      { id: 'R2', title: 'Найти UX-проблемы', desc: 'Эвристический анализ интерфейса', trigger: 'Запусти R2.' },
      { id: 'R3', title: 'Проверить WCAG', desc: 'Доступность по стандарту', trigger: 'Запусти R3.' },
      { id: 'R4', title: 'Сравнить с референсами', desc: 'Бенчмарк с лучшими примерами', trigger: 'Запусти R4.' },
      { id: 'R5', title: 'Дать общую оценку', desc: 'Итоговый вердикт по дизайну', trigger: 'Запусти R5.' },
      { id: 'R6', title: 'Найти inconsistency', desc: 'Несоответствия и противоречия', trigger: 'Запусти R6.' },
    ],
  },
  {
    id: '4', slug: 'handoff', name: 'Handoff',
    desc: 'Спецификации, acceptance criteria, release notes',
    skills: [
      { id: 'H1', title: 'Написать спецификацию', desc: 'Техническое описание решения', trigger: 'Запусти H1.' },
      { id: 'H2', title: 'Acceptance criteria', desc: 'Критерии приёмки для разработки', trigger: 'Запусти H2.' },
      { id: 'H3', title: 'Edge cases для разработки', desc: 'Граничные случаи для реализации', trigger: 'Запусти H3.' },
      { id: 'H4', title: 'Что не решено', desc: 'Открытые вопросы и риски', trigger: 'Запусти H4.' },
      { id: 'H5', title: 'Вопросы для разработки', desc: 'Технические уточнения', trigger: 'Запусти H5.' },
      { id: 'H6', title: 'Release notes', desc: 'Описание изменений для релиза', trigger: 'Запусти H6.' },
    ],
  },
  {
    id: '5', slug: 'communication', name: 'Communication',
    desc: 'Презентация решения, ответы на фидбек',
    skills: [
      { id: 'C1', title: 'Оформить решение для PM', desc: 'Краткое описание для стейкхолдеров', trigger: 'Запусти C1.' },
      { id: 'C2', title: 'Ответить на фидбек', desc: 'Аргументированный ответ на правки', trigger: 'Запусти C2.' },
      { id: 'C3', title: 'Обосновать решение', desc: 'Аргументация дизайн-решения', trigger: 'Запусти C3.' },
      { id: 'C4', title: 'Подготовить презентацию', desc: 'Структура и тезисы для презентации', trigger: 'Запусти C4.' },
      { id: 'C5', title: 'Summary встречи', desc: 'Итоги встречи с решениями', trigger: 'Запусти C5.' },
      { id: 'C6', title: 'Объяснить отклонение правки', desc: 'Почему правка не принята', trigger: 'Запусти C6.' },
    ],
  },
]

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Редизайн онбординга для нового агента',
    desc: 'Нужен онбординг который покажет ценность агентов для дизайнеров с первого запуска',
    createdAt: '2026-04-14',
    currentStage: 'discovery',
  },
  {
    id: '2',
    title: 'Агент для создания задач',
    desc: 'Агент для создания задач на базе контекста проекта',
    createdAt: '2026-04-14',
    currentStage: 'design',
  },
  {
    id: '3',
    title: 'Клининг для УК — Домклик',
    desc: 'Клининг для управляющих компаний и ТД для Домклик',
    createdAt: '2026-04-14',
    currentStage: 'review',
  },
]

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem('da-projects')
    if (raw === null) {
      localStorage.setItem('da-projects', JSON.stringify(INITIAL_PROJECTS))
      return INITIAL_PROJECTS
    }
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Project[]) : INITIAL_PROJECTS
  } catch {
    return INITIAL_PROJECTS
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem('da-projects', JSON.stringify(projects))
}
