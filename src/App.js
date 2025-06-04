import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext'

// 🧑‍💼 Páginas do Painel Admin
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import Categorias from './pages/Categorias'
import Cupons from './pages/Cupons'
import Usuarios from './pages/Usuarios'
import ProtectedRoute from './components/ProtectedRoute'

// 🛍️ Páginas Públicas da Loja
import Home from './pages/Home'
import CategoriasPublicas from './pages/CategoriasPublicas'
import ProdutoDetalhes from './pages/ProdutoDetalhes'
import Favoritos from './pages/Favoritos'
import CategoriaProdutos from './pages/CategoriaProdutos'
import EsqueciSenha from './pages/EsqueciSenha'
import ResetarSenha from './pages/ResetarSenha'

function App() {
  return (
    <Router>
      <FavoritesProvider>
        <Routes>
          {/* 🔐 Entrada padrão: Login */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/resetar-senha" element={<ResetarSenha />} />

          {/* 🧑‍💼 Rotas protegidas - Painel Admin */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <ProtectedRoute>
                <Produtos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute>
                <Categorias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cupons"
            element={
              <ProtectedRoute>
                <Cupons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            }
          />

          {/* 🛍️ Loja pública */}
          <Route path="/home" element={<Navigate to="/loja" />} />
          <Route path="/loja" element={<Home />} />
          <Route path="/loja/categorias" element={<CategoriasPublicas />} />
          <Route path="/loja/produto/:id" element={<ProdutoDetalhes />} />
          <Route path="/loja/favoritos" element={<Favoritos />} />
          <Route path="/loja/categorias/:id" element={<CategoriaProdutos />} />

          {/* Qualquer outra rota */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </FavoritesProvider>
    </Router>
  )
}

export default App
