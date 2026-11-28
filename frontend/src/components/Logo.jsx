import { Link } from 'react-router-dom'
import { CarFront } from 'lucide-react'

export default function Logo({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-onprimary shadow-[0_8px_20px_-8px_var(--primary)] transition group-hover:rotate-[-8deg]">
        <CarFront className="size-5" />
      </span>
      <span className="text-xl font-extrabold tracking-tight">
        IU<span className="text-primary">Drive</span>
      </span>
    </Link>
  )
}
