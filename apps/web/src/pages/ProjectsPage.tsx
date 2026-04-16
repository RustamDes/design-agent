import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProjects, STAGES } from '../types'
import { useSidebarResize } from '../hooks/useSidebarResize'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [projects] = useState(() => loadProjects())
  const { sidebarWidth, dividerHovered, setDividerHovered, onDividerMouseDown } = useSidebarResize()

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const stageIndexOf = (slug: string) => STAGES.findIndex(s => s.slug === slug)

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      fontFamily: 'system-ui, sans-serif',
      background: '#f7f7f5',
      overflow: 'hidden',
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: sidebarWidth,
        flexShrink: 0,
        background: '#f0efeb',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #e8e6e0', marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>Numa</div>
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px', fontWeight: '300' }}>AI для дизайнеров</div>
        </div>

        <button
          onClick={() => navigate('/new-project')}
          style={{
            all: 'unset', cursor: 'pointer',
            margin: '0 12px 16px',
            padding: '9px 14px',
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
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => navigate(`/project/${p.id}`)}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 16px', width: '100%', boxSizing: 'border-box',
                fontSize: '12px', color: '#666', overflow: 'hidden',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#e8e6e2'; el.style.color = '#333' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = '#666' }}
            >
              <div style={{
                width: '6px', height: '6px', flexShrink: 0, borderRadius: '50%',
                background: stageIndexOf(p.currentStage) <= 1 ? '#a0c0a0' : stageIndexOf(p.currentStage) <= 3 ? '#c8a060' : '#8090b8',
              }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
            </button>
          ))}
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
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '400', color: '#1a1a1a', marginBottom: '4px', marginTop: 0 }}>
            Ваши проекты
          </h1>
          <p style={{ fontSize: '13px', color: '#aaa', fontWeight: '300', marginTop: 0 }}>
            Выберите проект или создайте новый
          </p>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по проектам..."
          style={{
            width: '100%', maxWidth: '440px', padding: '10px 14px',
            background: '#fff', border: '1px solid #e8e6e0', borderRadius: '10px',
            fontSize: '13px', color: '#333', fontFamily: 'inherit',
            outline: 'none', marginBottom: '24px', boxSizing: 'border-box',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#c8c6c0')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e8e6e0')}
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}>
          {filtered.map(p => {
            const stageIdx = stageIndexOf(p.currentStage)
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/project/${p.id}`)}
                style={{
                  background: '#fff', border: '1px solid #e8e6e0',
                  borderRadius: '14px', padding: '20px', cursor: 'pointer',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#c8c6c0'; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e8e6e0'; el.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                  {STAGES.map((_, i) => (
                    <div key={i} style={{
                      height: '3px', flex: 1, borderRadius: '2px',
                      background: i < stageIdx ? '#7aaa7a' : i === stageIdx ? '#c88a30' : '#e8e6e0',
                    }} />
                  ))}
                </div>

                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a', marginBottom: '6px', lineHeight: '1.4' }}>
                  {p.title}
                </div>

                {p.desc && (
                  <div style={{
                    fontSize: '12px', color: '#aaa', lineHeight: '1.5', marginBottom: '14px',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  } as React.CSSProperties}>
                    {p.desc}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px',
                    border: '1px solid #e8e6e0', borderRadius: '5px', color: '#aaa',
                  }}>
                    {STAGES[stageIdx]?.name ?? p.currentStage}
                  </span>
                  <span style={{ fontSize: '10px', color: '#ccc' }}>
                    {new Date(p.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            )
          })}

          <div
            onClick={() => navigate('/new-project')}
            style={{
              background: 'transparent', border: '1.5px dashed #e0deda',
              borderRadius: '14px', padding: '20px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '8px', minHeight: '140px', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#c8c6c0'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#e0deda'}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 4v12M4 10h12"/>
            </svg>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Новый проект</div>
          </div>
        </div>
      </div>
    </div>
  )
}
