import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Todo } from './types/todo'
import './App.css'

function App() {
  const [user, setUser] = useState<any>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchTodos()
      } else {
        setTodos([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const fetchTodos = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data || [])
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      alert('회원가입 실패: ' + error.message)
    } else {
      alert('회원가입 성공! 이메일을 확인해주세요.')
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert('로그인 실패: ' + error.message)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('로그아웃 실패: ' + error.message)
    }
  }

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim() || !user) return

    const { data, error } = await supabase
      .from('todos')
      .insert([
        {
          text: newTodo,
          completed: false,
          user_id: user.id,
        },
      ])
      .select()

    if (error) {
      alert('Todo 추가 실패: ' + error.message)
    } else {
      setTodos([...(data || []), ...todos])
      setNewTodo('')
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id)

    if (error) {
      alert('Todo 업데이트 실패: ' + error.message)
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      )
    }
  }

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)

    if (error) {
      alert('Todo 삭제 실패: ' + error.message)
    } else {
      setTodos(todos.filter((todo) => todo.id !== id))
    }
  }

  if (loading) {
    return <div className="loading">로딩 중...</div>
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>📝 Todo App</h1>
          <p>Supabase + Vercel로 만든 Todo 앱</p>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">
              {isSignUp ? '회원가입' : '로그인'}
            </button>
          </form>
          <button
            className="toggle-auth"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? '이미 계정이 있으신가요? 로그인'
              : '계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <h1>📝 My Todos</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={handleSignOut} className="sign-out-btn">
            로그아웃
          </button>
        </div>
      </div>

      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          placeholder="새로운 Todo 추가..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="todo-input"
        />
        <button type="submit" className="add-btn">
          추가
        </button>
      </form>

      <div className="todos-container">
        {todos.length === 0 ? (
          <div className="empty-state">
            <p>아직 Todo가 없습니다. 새로운 Todo를 추가해보세요!</p>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="todo-checkbox"
                />
                <span className="todo-text">{todo.text}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-btn"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
