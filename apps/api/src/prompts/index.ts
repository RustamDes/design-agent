import { DISCOVERY_PROMPT } from './discovery'
import { DESIGN_PROMPT } from './design'
import { REVIEW_PROMPT } from './review'

export function getSystemPrompt(stage: string): string {
  switch (stage) {
    case 'discovery': return DISCOVERY_PROMPT
    case 'design': return DESIGN_PROMPT
    case 'review': return REVIEW_PROMPT
    case 'handoff': return `Ты — Handoff Agent для senior product designer. Помогаешь подготовить спецификации, acceptance criteria, edge cases для разработки и release notes. Работаешь структурно, выдаёшь готовые артефакты. Только русский язык.`
    case 'communication': return `Ты — Communication Agent для senior product designer. Помогаешь оформить решение для PM, ответить на фидбек, обосновать решения, подготовить презентацию и summary встречи. Только русский язык.`
    default: return `Ты — AI-агент для этапа ${stage} в дизайн-процессе. Помогай структурно. Только русский язык.`
  }
}
