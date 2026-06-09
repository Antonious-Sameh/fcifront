import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLanguage } from '@/context/LanguageContext.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { subjectsAPI, careersAPI, coursesAPI } from '@/lib/api';
import { Search, Sun, Moon, Menu, Globe, LogOut, BookOpen, Briefcase, GraduationCap, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import NotificationBell from '@/components/NotificationBell.jsx';
import { cn } from '@/lib/utils';

// Cache بسيط عشان ما نعملش طلبات كتير
let searchCache = null;

const loadSearchData = async () => {
  if (searchCache) return searchCache;
  try {
    const [careersRes, coursesRes] = await Promise.all([
      careersAPI.getAll(),
      coursesAPI.getAll(),
    ]);
    searchCache = {
      careers: careersRes.careers || [],
      courses: coursesRes.courses || [],
    };
    return searchCache;
  } catch {
    return { careers: [], courses: [] };
  }
};

const Topbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = useCallback(async (query) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const data = await loadSearchData();
      const q = query.toLowerCase();
      const results = [];

      data.careers.forEach(c => {
        const name = language === 'ar' ? c.name?.ar : (c.name?.en || c.name?.ar);
        if (name?.toLowerCase().includes(q)) {
          results.push({ title: name, type: language === 'ar' ? 'مسار مهني' : 'Career', icon: Briefcase, path: `/careers/${c.slug}` });
        }
      });

      data.courses.forEach(c => {
        const name = language === 'ar' ? c.title?.ar : (c.title?.en || c.title?.ar);
        if (name?.toLowerCase().includes(q)) {
          results.push({ title: name, type: language === 'ar' ? 'كورس' : 'Course', icon: BookOpen, path: '/courses' });
        }
      });

      // بحث في المحتوى الثابت للمواد (السنوات)
      ['رياضيات', 'فيزياء', 'حاسب', 'شبكات', 'برمجة', 'قواعد بيانات'].forEach(keyword => {
        if (keyword.includes(q) || q.includes(keyword.slice(0, 3))) {
          results.push({ title: keyword, type: 'مادة دراسية', icon: GraduationCap, path: '/university' });
        }
      });

      setSearchResults(results.slice(0, 6));
      setIsSearchOpen(true);
    } finally {
      setIsSearching(false);
    }
  }, [language]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) { setSearchResults([]); setIsSearchOpen(false); return; }
    debounceRef.current = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, doSearch]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleResultClick = (path) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className={cn("flex flex-1 items-center gap-4", isRTL ? "flex-row-reverse" : "flex-row")}>
          {/* Search */}
          <div className="relative flex-1 max-w-md hidden sm:block" ref={searchRef}>
            <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input
              type="search"
              placeholder={t('topbar.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setIsSearchOpen(true)}
              className={cn("w-full bg-muted/50 border-0 focus-visible:ring-1", isRTL ? "pr-10 pl-8 text-right" : "pl-10 pr-8")}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", isRTL ? "left-2" : "right-2")}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Dropdown */}
            {isSearchOpen && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
                {isSearching ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    {language === 'ar' ? 'جاري البحث...' : 'Searching...'}
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="py-1">
                    {searchResults.map((res, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => handleResultClick(res.path)}
                          className={cn("w-full px-4 py-2.5 hover:bg-muted flex items-center gap-3 transition-colors", isRTL ? "flex-row-reverse text-right" : "text-left")}
                        >
                          <div className="p-1.5 bg-primary/10 rounded text-primary shrink-0">
                            <res.icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{res.title}</div>
                            <div className="text-xs text-muted-foreground">{res.type}</div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={cn("flex items-center gap-1 ml-auto", isRTL ? "flex-row-reverse mr-auto ml-0" : "flex-row")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuItem onClick={() => changeLanguage('en')} className={cn(language === 'en' && "bg-accent")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ar')} className={cn(language === 'ar' && "bg-accent")}>العربية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-none">
                    <p className="font-medium text-sm">{user?.name}</p>
                    <p className="w-[180px] truncate text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-primary font-semibold mt-0.5 uppercase tracking-wide">{user?.role}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('topbar.logout')}</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('logout.confirm_title')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('logout.confirm_desc')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className={cn(isRTL && "sm:flex-row-reverse sm:justify-start gap-2")}>
                      <AlertDialogCancel>{t('logout.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('logout.confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;