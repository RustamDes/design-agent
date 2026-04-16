import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadProjects, STAGES } from '../types'
import type { Skill } from '../types'
import { useSidebarResize } from '../hooks/useSidebarResize'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  files?: { name: string; type: string }[]
}

export default function StagePage() {
  const navigate = useNavigate()
  const { id, stage: stageSlug } = useParams<{ id: string; stage: string }>()

  const projects = loadProjects()
  const project = projects.find(p => p.id === id)
  const stageIndex = STAGES.findIndex(s => s.slug === stageSlug)
  const stage = STAGES[stageIndex]

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [pathOpen, setPathOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { sidebarWidth, dividerHovered, setDividerHovered, onDividerMouseDown } = useSidebarResize()

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  // Reset chat when stage changes
  useEffect(() => {
    setMessages([])
    setInput('')
    setFiles([])
  }, [stageSlug])

  const adjustTextarea = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  const sendMessage = useCallback(async (text: string, attachedFiles?: File[]) => {
    if (!text.trim() && (!attachedFiles || attachedFiles.length === 0)) return
    setLoading(true)

    const usedFiles = attachedFiles ?? files
    const filesMeta = usedFiles.map(f => ({ name: f.name, type: f.type }))
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      files: filesMeta.length > 0 ? filesMeta : undefined,
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setFiles([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/v1/research/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, stage: stageSlug ?? 'discovery' }),
      })
      if (!res.ok) throw new Error('API error')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data) as { text?: string }
              if (parsed.text) {
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: m.content + parsed.text } : m)
                )
              }
            } catch { /* malformed chunk */ }
          }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: 'Ошибка соединения с сервером.' } : m)
      )
    } finally {
      setLoading(false)
    }
  }, [messages, files])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).slice(0, 6)
    setFiles(prev => [...prev, ...selected].slice(0, 6))
    e.target.value = ''
  }

  const copyText = (text: string) => navigator.clipboard.writeText(text)

  if (!stage) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '12px' }}>Этап не найден</div>
          <button onClick={() => navigate('/')} style={{ all: 'unset', cursor: 'pointer', fontSize: '13px', color: '#1a1a1a', textDecoration: 'underline' }}>
            Вернуться к проектам
          </button>
        </div>
      </div>
    )
  }

  const projectTitle = project?.title ?? 'Проект'
  const projectJira = `PROD-${String(id ?? '0').padStart(4, '0')}`

  return (
    <div style={{
      height: '100vh', display: 'flex',
      fontFamily: 'system-ui, sans-serif',
      background: '#f7f7f5', overflow: 'hidden',
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: sidebarWidth, flexShrink: 0,
        background: '#f0efeb', display: 'flex',
        flexDirection: 'column', padding: '0', overflow: 'hidden',
      }}>
        {/* Back */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8e6e0' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              all: 'unset', cursor: 'pointer', fontSize: '11px', color: '#aaa',
              display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11L5 7l4-4"/>
            </svg>
            Проекты
          </button>
          <div
            style={{
              fontSize: '12px', fontWeight: '500', color: '#1a1a1a',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              marginBottom: '4px', cursor: id ? 'pointer' : 'default',
            }}
            onClick={() => id && navigate(`/project/${id}`)}
            title={projectTitle}
          >
            {projectTitle}
          </div>
          <span style={{
            fontSize: '9px', padding: '2px 6px',
            border: '1px solid #e8e6e0', borderRadius: '4px',
            color: '#aaa', letterSpacing: '0.05em', display: 'inline-block',
          }}>
            {projectJira}
          </span>
        </div>

        {/* Stage stepper */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 0' }}>
          {STAGES.map((s, i) => {
            const isDone = i < stageIndex
            const isActive = i === stageIndex
            return (
              <button
                key={s.id}
                onClick={() => navigate(`/project/${id}/${s.slug}`)}
                style={{
                  all: 'unset', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 16px', width: '100%', boxSizing: 'border-box',
                  background: isActive ? '#e8e6e0' : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#e8e6e2' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  border: `1.5px solid ${isDone ? '#a0c8a0' : isActive ? '#1a1a1a' : '#ccc'}`,
                  background: isDone ? '#e8f2e8' : isActive ? '#1a1a1a' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '8px',
                  color: isDone ? '#5a9a6a' : isActive ? '#fff' : '#bbb',
                  transition: 'all 0.2s',
                }}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: '12px',
                  color: isDone ? '#7aaa7a' : isActive ? '#1a1a1a' : '#bbb',
                  fontWeight: isActive ? '500' : '400',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {s.name}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #e8e6e0' }}>
          <div style={{ fontSize: '10px', color: '#ccc', lineHeight: '1.5' }}>
            переходи на любой<br />этап в любой момент
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div
        onMouseDown={onDividerMouseDown}
        onMouseEnter={() => setDividerHovered(true)}
        onMouseLeave={() => setDividerHovered(false)}
        style={{
          width: '4px', flexShrink: 0, cursor: 'col-resize',
          background: dividerHovered ? '#d0cdc8' : '#e8e6e0',
          transition: 'background 0.15s',
        }}
      />

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'grid', gridTemplateRows: '1fr auto', overflow: 'hidden', background: '#f7f7f5' }}>

        {/* CHAT */}
        <div ref={chatRef} style={{ overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {messages.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                <div style={{ fontSize: '22px', fontWeight: '400', color: '#1a1a1a', marginBottom: '6px' }}>
                  {stage.name} Agent
                </div>
                <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '32px' }}>
                  Выбери скилл или напиши сообщение
                </div>

                {stageSlug === 'discovery' && (
                  <div style={{ maxWidth: '560px', margin: '0 auto 24px', textAlign: 'left' }}>
                    <button
                      onClick={() => setPathOpen(o => !o)}
                      style={{
                        all: 'unset', cursor: 'pointer', fontSize: '11px', color: '#aaa',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        marginBottom: pathOpen ? '8px' : '0',
                      }}
                    >
                      <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: pathOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                      Рекомендуемый путь →
                    </button>
                    {pathOpen && (
                      <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '2', paddingLeft: '16px' }}>
                        <div><span style={{ color: '#888' }}>Минимальный:</span> S1 → S4 → S7 <span style={{ color: '#ccc' }}>(15–30 мин)</span></div>
                        <div><span style={{ color: '#888' }}>Стандартный:</span> S1 → S2 → S4 → S5 → S7 <span style={{ color: '#ccc' }}>(45–60 мин)</span></div>
                        <div><span style={{ color: '#888' }}>Полный:</span> S1 → S2 → S3 → S4 → S5 → S6 → S7 <span style={{ color: '#ccc' }}>(90–120 мин)</span></div>
                      </div>
                    )}
                  </div>
                )}

                <SkillGrid skills={stage.skills} onSelect={t => sendMessage(t)} />
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={msg.id}>
                {i === 0 && (
                  <div style={{
                    display: 'inline-block', fontSize: '9px', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#b07820', padding: '3px 8px',
                    border: '1px solid #e8d8b0', borderRadius: '4px',
                    background: '#fdf8ee', marginBottom: '12px',
                  }}>
                    {stage.name}
                  </div>
                )}
                {msg.role === 'user' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      maxWidth: '65%', background: '#1a1a1a', color: '#ccc',
                      borderRadius: '14px 14px 2px 14px',
                      padding: '11px 16px', fontSize: '13px', lineHeight: '1.55',
                    }}>
                      {msg.files && msg.files.length > 0 && (
                        <div style={{ marginBottom: '8px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {msg.files.map((f, fi) => (
                            <span key={fi} style={{ fontSize: '10px', padding: '2px 8px', background: '#2a2a2a', borderRadius: '4px', color: '#888' }}>
                              📎 {f.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: '#1a1a1a', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '8px', color: '#666',
                      flexShrink: 0, letterSpacing: '0.05em',
                    }}>
                      DA
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', color: '#bbb', marginBottom: '6px', letterSpacing: '0.06em' }}>
                        {stage.name} Agent
                      </div>
                      <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.7', fontWeight: '300', whiteSpace: 'pre-wrap' }}>
                        {msg.content || (loading && i === messages.length - 1 ? <span style={{ color: '#ccc' }}>...</span> : '')}
                      </div>
                      {msg.content && (
                        <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                          <ActionButton onClick={() => copyText(msg.content)} icon={
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="5" y="5" width="9" height="9" rx="1.5"/>
                              <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/>
                            </svg>
                          } label="Копировать" />
                          <ActionButton onClick={() => {}} icon={
                            <svg width="9" height="13" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="1" width="4" height="4" rx="2"/>
                              <rect x="5" y="1" width="4" height="4" rx="2"/>
                              <rect x="1" y="5" width="4" height="4" rx="2"/>
                              <rect x="1" y="9" width="4" height="4" rx="2"/>
                              <circle cx="7" cy="7" r="2"/>
                            </svg>
                          } label="Figma" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <div style={{ padding: '0 24px 20px', background: '#f7f7f5' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%' }}>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {files.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: '#fff', border: '1px solid #e8e6e0',
                    borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#666',
                  }}>
                    📎 {f.name}
                    <button
                      onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      style={{ all: 'unset', cursor: 'pointer', color: '#bbb', fontSize: '13px', lineHeight: '1' }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              background: '#fff', border: '1px solid #e0deda',
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); adjustTextarea() }}
                onKeyDown={handleKeyDown}
                placeholder="Напиши сообщение..."
                rows={1}
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  padding: '13px 16px 6px', fontSize: '13px', color: '#333',
                  fontFamily: 'inherit', resize: 'none', background: 'transparent',
                  lineHeight: '1.5', maxHeight: '160px', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    ref={fileInputRef}
                    type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      all: 'unset', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      fontSize: '12px', color: '#aaa', padding: '5px 8px',
                      borderRadius: '7px', transition: 'background 0.1s, color 0.1s',
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#f5f4f0'; el.style.color = '#666' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#aaa' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 8.5V10a6 6 0 0 1-12 0V4a4 4 0 0 1 8 0v6a2 2 0 0 1-4 0V5"/>
                    </svg>
                    {files.length > 0 ? `${files.length}/6 файлов` : 'Файл или фото'}
                  </button>
                </div>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || (!input.trim() && files.length === 0)}
                  style={{
                    width: '32px', height: '32px',
                    background: loading || (!input.trim() && files.length === 0) ? '#e8e6e0' : '#1a1a1a',
                    border: 'none', borderRadius: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: loading || (!input.trim() && files.length === 0) ? 'default' : 'pointer',
                    transition: 'background 0.15s',
                    color: loading || (!input.trim() && files.length === 0) ? '#bbb' : '#fff',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 10V2M2 6l4-4 4 4"/>
                  </svg>
                </button>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#ccc', textAlign: 'center', marginTop: '8px' }}>
              Enter — отправить · Shift+Enter — новая строка
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkillGrid({ skills, onSelect }: { skills: Skill[]; onSelect: (trigger: string) => void }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '8px', maxWidth: '560px', margin: '0 auto', textAlign: 'left',
      alignItems: 'stretch',
    }}>
      {skills.map(skill => (
        <button
          key={skill.id}
          onClick={() => onSelect(skill.trigger)}
          style={{
            all: 'unset', cursor: 'pointer',
            background: '#fff', border: '1px solid #e8e6e0',
            borderRadius: '12px', padding: '14px', textAlign: 'left',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#c8c6c0'
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = '#e8e6e0'
            el.style.boxShadow = 'none'
          }}
        >
          <div style={{
            fontSize: '9px', color: '#aaa', background: '#f5f4f0',
            border: '1px solid #e8e6e0', borderRadius: '3px',
            padding: '1px 6px', display: 'inline-block',
            marginBottom: '8px', letterSpacing: '0.05em',
          }}>
            {skill.id}
          </div>
          <div style={{ fontSize: '12px', color: '#1a1a1a', fontWeight: '500', marginBottom: '4px' }}>
            {skill.title}
          </div>
          <div style={{ fontSize: '10px', color: '#aaa', lineHeight: '1.4', flex: 1 }}>
            {skill.desc}
          </div>
        </button>
      ))}
    </div>
  )
}

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '10px', color: '#bbb', padding: '4px 9px',
        borderRadius: '5px', border: '1px solid #e8e6e0',
        background: 'transparent', transition: 'border-color 0.15s, color 0.15s',
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#c8c6c0'; el.style.color = '#555' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e8e6e0'; el.style.color = '#bbb' }}
    >
      {icon}
      {label}
    </button>
  )
}
