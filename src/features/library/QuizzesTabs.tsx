import { NavLink } from 'react-router-dom'
import { BookOpen, Library } from 'lucide-react'
import { cn } from '@/utils'

/** Switch between the user's own quizzes and the ready-made quiz bank. */
export function QuizzesTabs() {
  const tab = ({ isActive }: { isActive: boolean }) =>
    cn('flex-1 sm:flex-none px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2', isActive ? 'bg-fg/12 text-fg' : 'text-fg/60 hover:text-fg')
  return (
    <div className="flex gap-0.5 bg-fg/6 border border-fg/10 rounded-lg p-0.5 mb-5 w-full sm:w-fit" role="tablist">
      <NavLink to="/quizzes" end className={tab} role="tab">
        <Library size={15} /> My quizzes
      </NavLink>
      <NavLink to="/quizzes/bank" className={tab} role="tab">
        <BookOpen size={15} /> Quiz bank
      </NavLink>
    </div>
  )
}
