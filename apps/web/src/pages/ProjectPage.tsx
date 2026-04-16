import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadProjects, saveProjects, STAGES } from '../types'
import { useSidebarResize } from '../hooks/useSidebarResize'

const STAGE_VISIT_LABELS = [
  'Последний визит: вчера',
  'Открыт 3 дня назад',
  'Ещё не открывался',
  'Ещё не открывался',
  'Ещё не открывался',
]

export default function ProjectPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [projects, setProjects] = useState(() => loadProjects())
  const [contextOpen, setContextOpen] = useState(false)
  const { sidebarWidth, dividerHovered, setDividerHovered, onDividerMouseDown } = useSidebarResize()

  const project = projects.find(p => p.id === id)

  if (!project) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '12px' }}>Проект не найден</div>
          <button
            onClick={() => navigate('/')}
            style={{ all: 'unset', cursor: 'pointer', fontSize: '13px', color: '#1a1a1a', textDecoration: 'underline' }}
          >
            Вернуться к проектам
          </button>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    const updated = projects.filter(p => p.id !== id)
    saveProjects(updated)
    setProjects(updated)
    navigate('/')
  }

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
        flexDirection: 'column', padding: '16px 0', overflow: 'hidden',
      }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #e8e6e0', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>Numa</div>
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px', fontWeight: '300' }}>AI для дизайнеров</div>
        </div>

        <button
          onClick={() => navigate('/new-project')}
          style={{
            all: 'unset', cursor: 'pointer',
            margin: '0 12px 16px', padding: '9px 14px',
            background: '#1a1a1a', color: '#f5f4f0',
            borderRadius: '9px', fontSize: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            fontFamily: 'inherit', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#333'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1a1a1a'}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5 1v8M1 5h8"/>
          </svg>
          Новый проект
        </button>

        <div style={{ padding: '0 16px 8px', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb' }}>
          Проекты
        </div>

        <div style={{ overflow: 'auto', flex: 1 }}>
          {projects.map(p => {
            const isActive = p.id === id
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/project/${p.id}`)}
                style={{
                  all: 'unset', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 16px', width: '100%', boxSizing: 'border-box',
                  fontSize: '12px', overflow: 'hidden',
                  background: isActive ? '#e8e6e2' : 'transparent',
                  color: isActive ? '#1a1a1a' : '#666',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = '#e8e6e2'
                    el.style.color = '#333'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'transparent'
                    el.style.color = '#666'
                  }
                }}
              >
                <div style={{
                  width: '6px', height: '6px', flexShrink: 0, borderRadius: '50%',
                  background: isActive ? '#1a1a1a' : '#c8a060',
                }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
              </button>
            )
          })}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #e8e6e0', marginTop: 'auto' }}>
          <div style={{ fontSize: '10px', color: '#bbb' }}>v0.1.0 · MVP</div>
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

      {/* MAIN */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                all: 'unset', cursor: 'pointer', fontSize: '11px', color: '#aaa',
                display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11L5 7l4-4"/>
              </svg>
              Все проекты
            </button>
            <h1 style={{ fontSize: '22px', fontWeight: '400', color: '#1a1a1a', margin: 0, lineHeight: '1.3' }}>
              {project.title}
            </h1>
          </div>
          <button
            onClick={handleDelete}
            style={{
              all: 'unset', cursor: 'pointer', flexShrink: 0,
              fontSize: '12px', color: '#bbb',
              padding: '6px 12px', borderRadius: '8px',
              border: '1px solid #e8e6e0',
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e08070'; el.style.color = '#e08070' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e8e6e0'; el.style.color = '#bbb' }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 13 6"/>
              <path d="M14 6l-1 8H3L2 6"/>
              <path d="M10 6V4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2"/>
            </svg>
            Удалить
          </button>
        </div>

        {/* Context accordion */}
        {project.desc && (
          <div style={{ marginBottom: '28px' }}>
            <button
              onClick={() => setContextOpen(o => !o)}
              style={{
                all: 'unset', cursor: 'pointer',
                width: '100%', boxSizing: 'border-box',
                background: '#f0efeb', border: '1px solid #e8e6e0',
                borderRadius: contextOpen ? '10px 10px 0 0' : '10px',
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#eae9e4'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f0efeb'}
            >
              <span style={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>Контекст проекта</span>
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"
                style={{ transition: 'transform 0.2s', transform: contextOpen ? 'rotate(180deg)' : 'none' }}
              >
                <path d="M2 4l4 4 4-4"/>
              </svg>
            </button>
            {contextOpen && (
              <div style={{
                background: '#fff', border: '1px solid #e8e6e0',
                borderTop: 'none', borderRadius: '0 0 10px 10px',
                padding: '14px 16px',
                fontSize: '13px', color: '#555', lineHeight: '1.6',
              }}>
                {project.desc}
              </div>
            )}
          </div>
        )}

        {/* Stages */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a', margin: '0 0 16px' }}>
            Этапы работы
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {STAGES.map((stage, i) => (
              <div
                key={stage.id}
                onClick={() => navigate(`/project/${id}/${stage.slug}`)}
                style={{
                  background: '#fff', border: '1px solid #e8e6e0',
                  borderRadius: '12px', padding: '12px',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = '#c8c6c0'
                  el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = '#e8e6e0'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: '10px', color: '#ccc', letterSpacing: '0.06em' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>
                  {stage.name}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.5', flex: 1 }}>
                  {stage.desc}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: i === 0 ? '#7aaa7a' : i === 1 ? '#c8a060' : '#ccc',
                }}>
                  {STAGE_VISIT_LABELS[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
