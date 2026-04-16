import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadProjects, saveProjects } from '../types'
import type { Project } from '../types'

const MAX_TITLE = 60

export function NewProjectPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming).filter(
      f => f.type.startsWith('image/') || f.type === 'application/pdf'
    )
    setFiles(prev => [...prev, ...valid].slice(0, 5))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const canSubmit = title.trim().length > 0

  const handleCreate = () => {
    if (!canSubmit) return
    const newProject: Project = {
      id: Date.now().toString(),
      title: title.trim(),
      desc: description.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      currentStage: 'discovery',
    }
    const existing = loadProjects()
    saveProjects([newProject, ...existing])
    navigate(`/project/${newProject.id}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f7f5',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* TOPBAR */}
      <div style={{
        height: '52px', background: '#fff',
        borderBottom: '1px solid #e8e6e0',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', color: '#aaa',
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 0', fontFamily: 'inherit',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11L5 7l4-4"/>
          </svg>
          Проекты
        </button>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '400', color: '#1a1a1a', marginBottom: '6px', marginTop: 0 }}>
            Новый проект
          </h1>
          <p style={{ fontSize: '13px', color: '#aaa', fontWeight: '300', marginBottom: '32px', marginTop: 0 }}>
            Опишите задачу и Discovery Agent поможет разобраться
          </p>

          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>Название проекта</label>
              <span style={{ fontSize: '11px', color: title.length >= MAX_TITLE ? '#e08050' : '#ccc' }}>
                {title.length}/{MAX_TITLE}
              </span>
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, MAX_TITLE))}
              placeholder="Например: Редизайн онбординга для нового агента"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '11px 14px',
                background: '#fff', border: '1px solid #e8e6e0', borderRadius: '10px',
                fontSize: '13px', color: '#1a1a1a', fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#c8c6c0')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e8e6e0')}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#555', fontWeight: '500', marginBottom: '6px' }}>
              Опишите задачу
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Что проектируете? Какую проблему решаете? Какая цель?"
              rows={5}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '11px 14px',
                background: '#fff', border: '1px solid #e8e6e0', borderRadius: '10px',
                fontSize: '13px', color: '#1a1a1a', fontFamily: 'inherit',
                outline: 'none', resize: 'vertical', lineHeight: '1.6', minHeight: '120px',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#c8c6c0')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e8e6e0')}
            />
          </div>

          {/* File upload */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#555', fontWeight: '500', marginBottom: '6px' }}>
              Файлы{' '}
              <span style={{ color: '#bbb', fontWeight: '400' }}>— необязательно</span>
            </label>
            <input
              ref={fileInputRef}
              type="file" multiple accept="image/*,.pdf"
              onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
              style={{ display: 'none' }}
            />
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `1.5px dashed ${isDragging ? '#999' : '#e0deda'}`,
                borderRadius: '10px', padding: '28px 24px', textAlign: 'center',
                cursor: 'pointer', background: isDragging ? '#f0efeb' : 'transparent',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ display: 'block', margin: '0 auto 8px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div style={{ fontSize: '12px', color: '#aaa' }}>Перетащите файлы или нажмите для выбора</div>
              <div style={{ fontSize: '10px', color: '#ccc', marginTop: '4px' }}>PDF или изображение</div>
            </div>

            {files.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {files.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    background: '#fff', border: '1px solid #e8e6e0',
                    borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#666',
                  }}>
                    📎 {f.name}
                    <button
                      onClick={ev => { ev.stopPropagation(); setFiles(prev => prev.filter((_, j) => j !== i)) }}
                      style={{ all: 'unset', cursor: 'pointer', color: '#bbb', fontSize: '14px', lineHeight: '1' }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={!canSubmit}
            style={{
              width: '100%', padding: '12px 20px',
              background: canSubmit ? '#1a1a1a' : '#e8e6e0',
              color: canSubmit ? '#f5f4f0' : '#bbb',
              border: 'none', borderRadius: '10px',
              fontSize: '13px', fontFamily: 'inherit',
              cursor: canSubmit ? 'pointer' : 'default',
              fontWeight: '500', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = '#333' }}
            onMouseLeave={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = '#1a1a1a' }}
          >
            Создать проект
          </button>
        </div>
      </div>
    </div>
  )
}
