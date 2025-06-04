// src/components/PublicHeader.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaSearch, FaStar } from 'react-icons/fa'
import { useFavorites } from '../context/FavoritesContext'
import logo from '../assets/logo-loja.png'

export default function PublicHeader() {
  const navigate = useNavigate()
  const { totalFavoritos } = useFavorites()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const onSearch = e => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/loja/categorias?search=${encodeURIComponent(query.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Botão de menu mobile */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => {
            setMobileMenuOpen(o => !o)
            setMobileSearchOpen(false)
          }}
        >
          <FaBars size={20} />
        </button>

        {/* Logo + Nome */}
        <Link to="/loja" className="flex items-center space-x-2">
          <img src={logo} alt="Magrin Store Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-primary">MAGRIN STORE</span>
        </Link>

        {/* Busca desktop */}
        <form
          onSubmit={onSearch}
          className="hidden md:flex items-center flex-1 max-w-md mx-4"
        >
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="
              flex-1 px-3
              h-10
              border border-gray-300 rounded-l
              focus:outline-none
            "
          />
          <button
            type="submit"
            className="
              flex items-center justify-center
              h-10 w-12
              border-t border-b border-r border-gray-300
              bg-primary hover:bg-primary-dark text-white
              rounded-r
            "
          >
            <FaSearch />
          </button>
        </form>

        <div className="flex items-center space-x-4">
          {/* Botão de busca mobile */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => {
              setMobileSearchOpen(o => !o)
              setMobileMenuOpen(false)
            }}
          >
            <FaSearch size={20} />
          </button>

          {/* Favoritos */}
          <Link to="/loja/favoritos" className="relative p-2 text-gray-700 hover:text-yellow-500 transition-colors">
            <FaStar size={20} />
            {totalFavoritos > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalFavoritos}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Menu móvel */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t">
          <ul className="flex flex-col">
            <li>
              <Link to="/loja" className="block px-4 py-2 hover:bg-gray-100">
                Início
              </Link>
            </li>
            <li>
              <Link to="/loja/categorias" className="block px-4 py-2 hover:bg-gray-100">
                Categorias
              </Link>
            </li>
            {/* … outros itens, se houver */}
          </ul>
        </nav>
      )}

      {/* Busca móvel */}
      {mobileSearchOpen && (
        <form
          onSubmit={onSearch}
          className="md:hidden flex items-stretch px-4 pb-4 bg-white"
        >
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="
              flex-1 px-3
              h-10
              border border-gray-300 rounded-l
              focus:outline-none
            "
          />
          <button
            type="submit"
            className="
              flex items-center justify-center
              h-10 w-12
              border-t border-b border-r border-gray-300
              bg-primary hover:bg-primary-dark text-white
              rounded-r
            "
          >
            <FaSearch />
          </button>
        </form>
      )}
    </header>
  )
}
