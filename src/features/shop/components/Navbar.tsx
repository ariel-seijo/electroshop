"use client";

import Container from "@/components/Container";
import Skeleton from "@/components/ui/Skeleton";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCart } from "@/features/cart";
import { useAuthStore } from "@/features/auth";
import { useToastStore } from "@/features/toast";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatPrice } from "@/lib/utils/currency";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCartIcon,
  UserRound,
  LogOut,
  Shield,
  LayoutDashboard,
  User,
  Package,
  Users,
  ClipboardList,
  Settings,
  Search,
  Menu,
  X,
} from "lucide-react";
import { Cart } from "@/features/cart";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Array<{ id: number; slug: string; title: string; thumbnail: string; price: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { cart, toggleCart } = useCart();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const initialized = useAuthStore((s) => s.initialized);
  const toast = useToastStore((s) => s.toast);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = user?.role === "ADMIN";
  const displayName = user?.name || user?.email?.split("@")[0];

  const isActive = (href: string) => pathname === href;

  const debouncedSearch = useDebounce(search, 300);

  const fetchResults = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedSearch);
  }, [debouncedSearch, fetchResults]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setShowUserMenu(false);
        setShowDropdown(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    toast("Sesión cerrada exitosamente", "success");
    router.push("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleResultClick = () => {
    setSearch("");
    setResults([]);
    setShowDropdown(false);
  };

  const categories = [
    { href: "/", label: "INICIO" },
    { href: "/category/gpu", label: "GPU" },
    { href: "/category/cpu", label: "CPU" },
    { href: "/category/ram", label: "RAM" },
    { href: "/category/storage", label: "ALMACENAMIENTO" },
  ];

  const iconBtn =
    "text-[1.5rem] cursor-pointer relative border-none bg-transparent text-[rgb(199,198,198)] flex justify-center items-center p-1 rounded-md transition-[color,background] duration-[150ms] hover:text-white hover:bg-white/5";

  const drawerLink =
    "flex items-center gap-3 px-6 py-[0.9rem] text-[0.95rem] font-semibold text-text-tertiary no-underline transition-[background,color] duration-[150ms] border-l-[3px] border-l-transparent hover:bg-surface-30 hover:text-white hover:border-l-accent";

  return (
    <>
      <div className="sticky top-0 z-[1000]">
        <nav className="w-full h-20 flex items-center bg-surface-2b max-xl2:px-4 max-xl2:gap-4 max-md:h-16 max-md:px-4 max-md:flex-nowrap max-md:gap-0 max-md:justify-between" role="navigation" aria-label="Navegación principal">
          <Container>
            <div className="flex items-center gap-3">
              <button
                className="hidden bg-transparent border-none text-[rgb(199,198,198)] cursor-pointer p-1.5 rounded-md transition-[background,color] duration-[150ms] min-w-11 min-h-11 items-center justify-center hover:bg-white/5 hover:text-white max-md:flex"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={mobileMenuOpen}
              >
                <Menu size={28} />
              </button>

              <h1 className="text-[2.4rem] m-0 max-xl2:text-[2rem] max-md:text-[1.5rem]">
                <Link className="no-underline font-cosmic font-thin tracking-[3px] text-accent" href="/" onClick={closeMobileMenu}>
                  ELECTROSHOP
                </Link>
              </h1>
            </div>

            <div className="relative flex-1 max-w-[440px] min-w-0 max-xl2:max-w-[300px] max-md:hidden" ref={searchRef}>
              <div className="relative flex items-center">
                <Search className="absolute right-3 text-accent pointer-events-none shrink-0" size={18} />
                <input
                  type="text"
                  placeholder="BUSCAR PRODUCTOS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full h-[45px] py-2 pr-10 pl-[0.7rem] bg-[#121212] text-white border border-transparent outline-none text-[0.9rem] transition-colors duration-200 focus:border-accent focus:outline-none placeholder:text-text-placeholder-dark placeholder:font-semibold"
                  aria-label="Buscar productos"
                  autoComplete="off"
                />
              </div>

              {search.trim() && showDropdown && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1a1a1a] border border-[#2e2e2e] shadow-[0_10px_25px_rgba(0,0,0,0.45)] z-[3000] overflow-hidden max-md:max-h-[340px] max-md:overflow-y-auto" role="listbox" aria-label="Resultados de búsqueda">
                  {loading && (
                    <div className="py-4 text-accent text-[0.85rem] text-center animate-[pulse_1.4s_ease-in-out_infinite] motion-reduce:animate-none">
                      Buscando...
                    </div>
                  )}
                  {!loading && results.length > 0 &&
                    results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="flex items-center gap-3 p-3 no-underline text-white transition-colors duration-200 hover:bg-[#242424] max-ms:py-[0.65rem]"
                        onClick={handleResultClick}
                        role="option"
                      >
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="w-[52px] h-[52px] object-contain bg-[#111] p-[0.3rem] shrink-0 max-ms:w-[46px] max-ms:h-[46px]"
                        />
                        <div className="flex flex-col gap-[0.2rem] min-w-0">
                          <span className="text-[0.88rem] font-semibold text-[#e8e8e8] truncate max-ms:text-[0.8rem]">{product.title}</span>
                          <span className="text-[0.8rem] font-semibold text-accent">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  {!loading && hasSearched && results.length === 0 && (
                    <div className="py-4 text-[#9a9a9a] text-[0.88rem] text-center">Sin resultados</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center items-center gap-2">
              <button
                className={`${iconBtn} hidden max-md:flex`}
                onClick={() => {
                  setMobileSearchOpen(!mobileSearchOpen);
                  setMobileMenuOpen(false);
                }}
                aria-label="Buscar"
                aria-expanded={mobileSearchOpen}
              >
                <Search size={28} />
              </button>

              <div className="relative" ref={menuRef}>
                {!mounted || !initialized ? (
                  <Skeleton variant="circle" width={30} height={30} role="status" aria-label="Cargando sesión" />
                ) : (
                  <>
                    <button
                      className={iconBtn}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      aria-label="Menú de usuario"
                      aria-expanded={showUserMenu}
                    >
                      <UserRound size={30} />
                      {isAdmin && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#dc2626] to-danger text-white text-[0.52rem] font-semibold tracking-[0.5px] px-[5px] py-px rounded-[3px] pointer-events-none whitespace-nowrap">
                          ADMIN
                        </span>
                      )}
                    </button>

                    {showUserMenu && (
                      <div className={`absolute top-[calc(100%+10px)] right-0 w-[250px] bg-surface-20 border border-border-38 shadow-[0_12px_30px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(255,255,255,0.03)] rounded-xl z-[3000] overflow-hidden transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${showUserMenu ? "opacity-100 visible translate-y-0 scale-100" : "opacity-0 invisible -translate-y-2 scale-[0.97]"}`}>
                        {user ? (
                          <>
                            <div className="flex items-center gap-[0.9rem] py-4 px-[1.2rem] bg-surface-26 border-b border-border-38">
                              <div className="shrink-0 size-9 rounded-full bg-[rgb(32,32,32)] border border-border-50 flex items-center justify-center text-text-muted">
                                {isAdmin ? <Shield size={18} /> : <User size={18} />}
                              </div>
                              <div className="min-w-0">
                                {isAdmin ? (
                                  <span className="block text-[0.65rem] font-semibold text-danger tracking-[1.2px] mb-0.5">
                                    ADMIN
                                  </span>
                                ) : (
                                  <span className="block text-[0.65rem] font-semibold text-text-dim uppercase tracking-[1.2px] mb-0.5">
                                    cliente <span className="normal-case tracking-normal text-[#e6e6e6] text-[0.82rem] font-semibold">{displayName}</span>
                                  </span>
                                )}
                                <span className="block text-xs font-semibold text-text-placeholder truncate">{user.email}</span>
                              </div>
                            </div>
                            {isAdmin ? (
                              <>
                                <Link href="/admin" className="flex items-center gap-[0.8rem] py-3 px-[1.2rem] text-accent text-[0.85rem] font-semibold no-underline transition-[background,color] duration-[150ms] border-l-2 border-l-transparent hover:bg-accent/10 hover:border-l-accent" onClick={() => setShowUserMenu(false)} prefetch={false}>
                                  <LayoutDashboard size={15} />
                                  Dashboard
                                </Link>
                                <Link href="/admin/products" className="flex items-center gap-[0.8rem] py-3 px-[1.2rem] text-text-secondary text-[0.85rem] font-semibold no-underline transition-[background,color] duration-[150ms] border-l-2 border-l-transparent hover:bg-surface-30 hover:text-white hover:border-l-accent" onClick={() => setShowUserMenu(false)} prefetch={false}>
                                  <Package size={15} />
                                  Productos
                                </Link>
                                <Link href="/admin/users" className="flex items-center gap-[0.8rem] py-3 px-[1.2rem] text-text-secondary text-[0.85rem] font-semibold no-underline transition-[background,color] duration-[150ms] border-l-2 border-l-transparent hover:bg-surface-30 hover:text-white hover:border-l-accent" onClick={() => setShowUserMenu(false)} prefetch={false}>
                                  <Users size={15} />
                                  Usuarios
                                </Link>
                                <Link href="/admin/orders" className="flex items-center gap-[0.8rem] py-3 px-[1.2rem] text-text-secondary text-[0.85rem] font-semibold no-underline transition-[background,color] duration-[150ms] border-l-2 border-l-transparent hover:bg-surface-30 hover:text-white hover:border-l-accent" onClick={() => setShowUserMenu(false)} prefetch={false}>
                                  <ClipboardList size={15} />
                                  Pedidos
                                </Link>
                                <Link href="/admin/settings" className="flex items-center gap-[0.8rem] py-3 px-[1.2rem] text-text-secondary text-[0.85rem] font-semibold no-underline transition-[background,color] duration-[150ms] border-l-2 border-l-transparent hover:bg-surface-30 hover:text-white hover:border-l-accent" onClick={() => setShowUserMenu(false)} prefetch={false}>
                                  <Settings size={15} />
                                  Ajustes
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link href="/profile" className="flex items-center gap-[0.8rem] py-3 px-[1.2rem] text-text-secondary text-[0.85rem] font-semibold no-underline transition-[background,color] duration-[150ms] border-l-2 border-l-transparent hover:bg-surface-30 hover:text-white hover:border-l-accent" onClick={() => setShowUserMenu(false)}>
                                  <User size={15} />
                                  Mi perfil
                                </Link>
                                <Link href="/orders" className="flex items-center gap-[0.8rem] py-3 px-[1.2rem] text-text-secondary text-[0.85rem] font-semibold no-underline transition-[background,color] duration-[150ms] border-l-2 border-l-transparent hover:bg-surface-30 hover:text-white hover:border-l-accent" onClick={() => setShowUserMenu(false)}>
                                  <Package size={15} />
                                  Mis pedidos
                                </Link>
                              </>
                            )}
                            <div className="h-px bg-border-38 mx-4 my-1" />
                            <button onClick={handleLogout} className="flex items-center gap-[0.8rem] w-full py-3 px-[1.2rem] text-[0.85rem] font-semibold text-danger-light bg-transparent border-none border-l-2 border-l-transparent cursor-pointer transition-[background,border-color] duration-[150ms] hover:bg-danger/10 hover:border-l-danger">
                              <LogOut size={15} />
                              Salir
                            </button>
                          </>
                        ) : (
                          <>
                            <Link href="/login" className="flex items-center gap-[0.8rem] py-3 px-[1.2rem] text-text-secondary text-[0.85rem] font-semibold no-underline transition-[background,color] duration-[150ms] border-l-2 border-l-transparent hover:bg-surface-30 hover:text-white hover:border-l-accent" onClick={() => setShowUserMenu(false)}>
                              Iniciar Sesión
                            </Link>
                            <div className="h-px bg-border-38 mx-4 my-1" />
                            <Link href="/register" className="flex items-center gap-[0.8rem] py-3 px-[1.2rem] text-text-secondary text-[0.85rem] font-semibold no-underline transition-[background,color] duration-[150ms] border-l-2 border-l-transparent hover:bg-surface-30 hover:text-white hover:border-l-accent" onClick={() => setShowUserMenu(false)}>
                              Registrarse
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  className={`${iconBtn}`}
                  onClick={toggleCart}
                  aria-label={`Carrito, ${totalItems} items`}
                >
                  <ShoppingCartIcon size={30} />
                  {totalItems > 0 && (
                    <span className="absolute -top-[5px] -right-2 bg-[linear-gradient(135deg,#007fff,#00cfff)] text-white text-[0.7rem] rounded-full px-1.5 py-0.5 pointer-events-none">
                      {totalItems}
                    </span>
                  )}
                </button>
                <Cart />
              </div>
            </div>
          </Container>
        </nav>

        <div className="w-full h-1 bg-[linear-gradient(90deg,#007fff,#00cfff,#007fff)] bg-[length:200%_100%] animate-electric motion-reduce:animate-none" />
      </div>

      <nav className="w-full h-[50px] flex items-center justify-center bg-[#121212] max-md:fixed max-md:left-0 max-md:bottom-0 max-md:w-full max-md:h-[60px] max-md:px-4 max-md:z-[2000] max-md:bg-[#121212] max-md:border-t max-md:border-[#1f1f1f] max-ms:h-14 max-ms:px-2" role="navigation" aria-label="Categorías">
        <Container>
          <ul className="p-0 m-0 list-none w-full flex justify-center items-center gap-[60px] max-xl2:gap-[30px] max-md:h-full max-md:justify-around max-md:gap-0 max-md:flex-nowrap">
            {categories.map((cat) => (
              <li key={cat.href}>
                <Link
                  href={cat.href}
                  className={`relative inline-block font-sans text-[0.9rem] font-semibold text-[rgb(163,163,163)] no-underline transition-colors duration-[250ms] pb-1.5 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-accent after:scale-x-0 after:origin-center after:transition-transform after:duration-[250ms] hover:text-accent hover:after:scale-x-100 motion-reduce:after:transition-none max-md:text-[0.8rem] max-md:pb-0 max-md:after:bottom-[-6px] max-ms:text-[0.68rem] max-ms:after:bottom-[-5px] ${
                    isActive(cat.href) ? "text-accent after:scale-x-100" : ""
                  }`}
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <div
        className={`fixed inset-0 bg-black/55 z-[4000] transition-[opacity,visibility] duration-300 motion-reduce:transition-none ${
          mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 w-[320px] max-w-[85vw] bg-[#1a1a1a] z-[5000] overflow-y-auto flex flex-col transition-transform duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } max-ms:w-[280px] max-ms:max-w-[85vw]`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className="flex items-center justify-between px-5 py-[1.2rem] border-b border-[#2e2e2e]">
          <Link className="font-cosmic text-[1.4rem] font-thin tracking-[2px] text-accent no-underline" href="/" onClick={closeMobileMenu}>
            ELECTROSHOP
          </Link>
          <button
            className="bg-transparent border-none text-text-tertiary cursor-pointer p-1.5 rounded-md flex items-center justify-center min-w-11 min-h-11 transition-[background,color] duration-[150ms] hover:bg-white/5 hover:text-white"
            onClick={closeMobileMenu}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        <ul className="list-none py-2 m-0">
          {categories.map((cat) => (
            <li key={cat.href}>
              <Link
                href={cat.href}
                className={`${drawerLink} ${isActive(cat.href) ? "text-accent border-l-accent" : ""}`}
                onClick={closeMobileMenu}
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="h-px bg-[#2e2e2e] mx-5 my-2" />

        <div className="px-5 py-3 pb-6 mt-auto">
          {!mounted || !initialized ? (
            <div className="flex items-center gap-3 py-2" aria-label="Cargando sesión">
              <Skeleton variant="circle" width={34} height={34} />
              <Skeleton width={120} height={14} />
            </div>
          ) : user ? (
            <>
              <div className="flex items-center gap-3 py-2 pb-3">
                <div className="shrink-0 size-9 rounded-full bg-[rgb(32,32,32)] border border-border-50 flex items-center justify-center text-text-muted">
                  {isAdmin ? <Shield size={18} /> : <User size={18} />}
                </div>
                <div>
                  <span className="block text-[0.9rem] font-semibold text-[#e8e8e8]">
                    {displayName}
                    {isAdmin && <span className="inline-block ml-2 px-[5px] py-px text-[0.55rem] font-semibold bg-danger text-white rounded-[3px] align-middle">ADMIN</span>}
                  </span>
                  <span className="block text-xs text-text-subtle mt-0.5">{user.email}</span>
                </div>
              </div>
              <ul className="list-none py-2 m-0">
                {isAdmin ? (
                  <>
                    <li><Link href="/admin" className={drawerLink} onClick={closeMobileMenu} prefetch={false}><LayoutDashboard size={15} />Dashboard</Link></li>
                    <li><Link href="/admin/products" className={drawerLink} onClick={closeMobileMenu} prefetch={false}><Package size={15} />Productos</Link></li>
                    <li><Link href="/admin/users" className={drawerLink} onClick={closeMobileMenu} prefetch={false}><Users size={15} />Usuarios</Link></li>
                    <li><Link href="/admin/orders" className={drawerLink} onClick={closeMobileMenu} prefetch={false}><ClipboardList size={15} />Pedidos</Link></li>
                    <li><Link href="/admin/settings" className={drawerLink} onClick={closeMobileMenu} prefetch={false}><Settings size={15} />Ajustes</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/profile" className={drawerLink} onClick={closeMobileMenu}><User size={15} />Mi perfil</Link></li>
                    <li><Link href="/orders" className={drawerLink} onClick={closeMobileMenu}><Package size={15} />Mis pedidos</Link></li>
                  </>
                )}
              </ul>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 mt-2 text-[0.9rem] font-semibold text-danger-light bg-transparent border border-[#3a1f1f] rounded-lg cursor-pointer transition-colors duration-[150ms] hover:bg-danger/10">
                <LogOut size={15} />
                Salir
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-[0.6rem]">
              <Link href="/login" className="block w-full px-[0.8rem] py-[0.8rem] text-[0.9rem] font-semibold text-center no-underline text-white bg-accent rounded-lg transition-colors duration-[150ms] hover:bg-[#1e93d9]" onClick={closeMobileMenu}>
                Iniciar Sesión
              </Link>
              <Link href="/register" className="block w-full px-[0.8rem] py-[0.8rem] text-[0.9rem] font-semibold text-center no-underline text-text-tertiary bg-transparent border border-[#3a3a3a] rounded-lg transition-colors duration-[150ms] hover:bg-white/5 hover:border-[#555]" onClick={closeMobileMenu}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </aside>

      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-[#121212] z-[6000] flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 py-3 px-4 border-b border-[#2e2e2e] bg-[#1a1a1a]">
            <button
              className="bg-transparent border-none text-text-tertiary cursor-pointer p-1.5 rounded-md flex items-center justify-center min-w-11 min-h-11 shrink-0 transition-colors duration-[150ms] hover:text-white"
              onClick={() => {
                setMobileSearchOpen(false);
                setSearch("");
                setResults([]);
              }}
              aria-label="Cerrar búsqueda"
            >
              <X size={22} />
            </button>
            <div className="relative flex-1 flex items-center">
              <Search size={18} className="absolute right-3 text-accent pointer-events-none shrink-0" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="BUSCAR PRODUCTOS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full h-11 py-2 pr-10 pl-3 bg-[#0f0f0f] text-white border border-[#2e2e2e] outline-none text-base rounded-md focus:border-accent focus:outline-none placeholder:text-[rgb(80,80,80)] placeholder:font-semibold"
                aria-label="Buscar productos"
                autoComplete="off"
              />
            </div>
          </div>

          {search.trim() && (
            <div className="flex-1 overflow-y-auto py-2">
              {loading && (
                <div className="py-4 text-accent text-[0.85rem] text-center animate-[pulse_1.4s_ease-in-out_infinite] motion-reduce:animate-none">
                  Buscando...
                </div>
              )}
              {!loading && results.length > 0 &&
                results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="flex items-center gap-3 p-3 no-underline text-white transition-colors duration-200 hover:bg-[#242424] max-ms:py-[0.65rem]"
                    onClick={() => {
                      handleResultClick();
                      setMobileSearchOpen(false);
                    }}
                  >
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="w-[52px] h-[52px] object-contain bg-[#111] p-[0.3rem] shrink-0 max-ms:w-[46px] max-ms:h-[46px]"
                    />
                    <div className="flex flex-col gap-[0.2rem] min-w-0">
                      <span className="text-[0.88rem] font-semibold text-[#e8e8e8] truncate max-ms:text-[0.8rem]">{product.title}</span>
                      <span className="text-[0.8rem] font-semibold text-accent">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              {!loading && hasSearched && results.length === 0 && (
                <div className="py-4 text-[#9a9a9a] text-[0.88rem] text-center">Sin resultados</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
