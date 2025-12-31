
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  ShoppingBag, 
  MessageSquare, 
  User, 
  Bell, 
  PlusCircle, 
  Briefcase,
  MapPin,
  Star,
  CheckCircle,
  Menu,
  X,
  Send,
  FileText,
  Settings,
  Moon,
  Sun,
  Globe,
  Lock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { MOCK_PROFESSIONALS, MOCK_POSTS, MOCK_PRODUCTS } from './constants';
import { Professional, Post, Product, Location, Contract, ContractStatus, Message } from './types';
import { getAIRecommendations } from './services/geminiService';

// --- Types for Settings ---
interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: 'pt' | 'en';
  privacyMode: boolean;
}

// --- Sub-components ---

const Badge: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mr-1 mb-1">
    {text === 'Verificado' && <CheckCircle className="w-3 h-3 mr-1" />}
    {text}
  </span>
);

const ProfessionalCard: React.FC<{ prof: Professional; onChat: (p: Professional) => void }> = ({ prof, onChat }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
    <div className="relative h-24 bg-slate-100 dark:bg-slate-800">
      <img src={prof.coverImage} className="w-full h-full object-cover" alt="cover" />
      <img src={prof.avatar} className="absolute -bottom-6 left-4 w-16 h-16 rounded-full border-4 border-white dark:border-slate-900 object-cover" alt="avatar" />
    </div>
    <div className="pt-8 pb-4 px-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{prof.name}</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{prof.role}</p>
        </div>
        <div className="flex items-center text-amber-500 font-bold text-sm">
          <Star className="w-4 h-4 fill-current mr-1" />
          {prof.rating}
        </div>
      </div>
      <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
        <MapPin className="w-3 h-3 mr-1" />
        {prof.location.city}, {prof.location.province}
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{prof.bio}</p>
      <div className="mt-4 flex flex-wrap">
        {prof.badges.map(b => <Badge key={b} text={b} />)}
      </div>
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => onChat(prof)}
          className="flex-1 py-2 bg-slate-900 dark:bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors"
        >
          Contratar
        </button>
        <button className="flex-1 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Ver Perfil
        </button>
      </div>
    </div>
  </div>
);

const Navbar: React.FC<{ activeTab: string; setTab: (t: string) => void }> = ({ activeTab, setTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Feed' },
    { id: 'explore', icon: Search, label: 'Explorar' },
    { id: 'market', icon: ShoppingBag, label: 'Mercado' },
    { id: 'messages', icon: MessageSquare, label: 'Mensagens' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:top-0 lg:bottom-auto bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-b border-slate-200 dark:border-slate-800 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="hidden lg:flex items-center font-bold text-2xl text-blue-600">
            Conecta<span className="text-slate-900 dark:text-white">+</span>
          </div>
          <div className="flex-1 flex justify-around lg:justify-end lg:gap-8 h-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex flex-col lg:flex-row items-center justify-center gap-1 px-2 transition-colors relative ${
                  activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <tab.icon className="w-6 h-6" />
                <span className="text-[10px] lg:text-sm font-medium">{tab.label}</span>
                {activeTab === tab.id && <div className="absolute bottom-0 h-1 w-8 bg-blue-600 rounded-t lg:hidden"></div>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [viewState, setViewState] = useState<'default' | 'settings'>('default');
  const [userLocation, setUserLocation] = useState<Location>({ country: 'Angola', province: 'Luanda', city: 'Luanda' });
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedProfs, setRecommendedProfs] = useState<Professional[]>(MOCK_PROFESSIONALS);
  const [isSearching, setIsSearching] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    notifications: true,
    language: 'pt',
    privacyMode: false
  });

  // Chat & Contract State
  const [selectedChatProf, setSelectedChatProf] = useState<Professional | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showContractModal, setShowContractModal] = useState(false);
  const [activeContract, setActiveContract] = useState<Contract | null>(null);

  // Sync Theme with HTML class
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        console.log("Found location", pos.coords);
      });
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    const result = await getAIRecommendations(searchQuery, userLocation, MOCK_PROFESSIONALS);
    const filtered = MOCK_PROFESSIONALS.filter(p => result.recommendedIds.includes(p.id));
    setRecommendedProfs(filtered.length > 0 ? filtered : MOCK_PROFESSIONALS);
    setIsSearching(false);
  };

  const handleOpenChat = (prof: Professional) => {
    setSelectedChatProf(prof);
    setActiveTab('messages');
    setMessages([
      { id: '1', senderId: prof.id, text: `Olá! Sou o ${prof.name}. Como posso ajudar com seus projetos de ${prof.specialty}?`, timestamp: 'Agora', type: 'TEXT' }
    ]);
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !selectedChatProf) return;
    const newMessage: Message = { id: Date.now().toString(), senderId: 'me', text: chatInput, timestamp: 'Agora', type: 'TEXT' };
    setMessages([...messages, newMessage]);
    setChatInput('');
  };

  const createContract = () => {
    if (!selectedChatProf) return;
    const newContract: Contract = {
      id: 'cont-' + Date.now(),
      clientId: 'me',
      professionalId: selectedChatProf.id,
      serviceName: selectedChatProf.specialty,
      scope: 'Desenvolvimento e entrega conforme conversado via chat.',
      price: selectedChatProf.hourlyRate || 0,
      deadline: '7 dias',
      status: ContractStatus.NEGOTIATING,
      termsAcceptedByClient: true,
      termsAcceptedByProfessional: false
    };
    setActiveContract(newContract);
    setShowContractModal(true);
  };

  const signContract = () => {
    if (activeContract) {
      setActiveContract({ ...activeContract, status: ContractStatus.ACTIVE, termsAcceptedByProfessional: true });
      setMessages([...messages, { 
        id: 'msg-contract', 
        senderId: 'system', 
        text: 'Contrato Formalizado com Sucesso!', 
        timestamp: 'Agora', 
        type: 'PROPOSAL',
        metadata: { status: 'ACTIVE' }
      }]);
      setTimeout(() => setShowContractModal(false), 1500);
    }
  };

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 lg:pt-20 transition-colors">
      <Navbar activeTab={activeTab} setTab={(t) => { setActiveTab(t); setViewState('default'); }} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* --- FEED SECTION --- */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <User className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="O que está a acontecer no seu mundo profissional?" 
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="mt-4 pt-4 border-t dark:border-slate-800 flex justify-between">
                  <button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                    <PlusCircle className="w-5 h-5 text-blue-500" /> Imagem
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">Publicar</button>
                </div>
              </div>

              {/* Feed Posts */}
              {MOCK_POSTS.map(post => (
                <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="p-4 flex gap-3 items-center">
                    <img src={post.userAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div>
                      <h4 className="font-bold text-sm">{post.userName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{post.timestamp}</p>
                    </div>
                  </div>
                  <div className="px-4 pb-3">
                    <p className="text-slate-800 dark:text-slate-300 text-sm leading-relaxed">{post.content}</p>
                  </div>
                  {post.image && <img src={post.image} className="w-full object-cover max-h-96" alt="" />}
                  <div className="p-3 border-t dark:border-slate-800 flex justify-between text-slate-600 dark:text-slate-400 text-sm">
                    <button className="flex-1 flex justify-center py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Gostar ({post.likes})</button>
                    <button className="flex-1 flex justify-center py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Comentar ({post.comments})</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar widgets */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold mb-4">Recomendados para Si</h3>
                <div className="space-y-4">
                  {MOCK_PROFESSIONALS.slice(0, 3).map(p => (
                    <div key={p.id} className="flex gap-3 items-center">
                      <img src={p.avatar} className="w-10 h-10 rounded-full" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{p.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.specialty}</p>
                      </div>
                      <button onClick={() => handleOpenChat(p)} className="text-blue-600 dark:text-blue-400 font-bold text-xs">Conectar</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- EXPLORE SECTION --- */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold mb-2">Encontrar Profissionais</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">IA priorizando talentos em {userLocation.city}.</p>
              
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex: 'Desenvolvedor em Luanda' ou 'Eletricista urgente'" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedProfs.map(prof => (
                <ProfessionalCard key={prof.id} prof={prof} onChat={handleOpenChat} />
              ))}
            </div>
          </div>
        )}

        {/* --- MARKETPLACE SECTION --- */}
        {activeTab === 'market' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Marketplace</h2>
              <div className="flex gap-2">
                <button className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Vender Produto
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {MOCK_PRODUCTS.map(prod => (
                <div key={prod.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group">
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={prod.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      {prod.type === 'COURSE' ? 'Curso' : 'Físico'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm truncate">{prod.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{prod.category}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-blue-600 dark:text-blue-400 font-bold">{prod.price.toLocaleString()} Kz</p>
                      <div className="flex items-center text-amber-500 text-xs">
                        <Star className="w-3 h-3 fill-current mr-0.5" /> {prod.rating}
                      </div>
                    </div>
                    <button className="w-full mt-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MESSAGES & CHAT SECTION --- */}
        {activeTab === 'messages' && (
          <div className="bg-white dark:bg-slate-900 h-[calc(100vh-160px)] rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex">
            {/* Conversations List */}
            <div className="hidden md:flex w-80 border-r border-slate-200 dark:border-slate-800 flex-col h-full overflow-hidden shrink-0">
              <div className="p-4 border-b dark:border-slate-800">
                <h3 className="font-bold text-lg">Mensagens</h3>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {selectedChatProf && (
                  <div className="p-4 flex gap-3 bg-blue-50 dark:bg-blue-900/20 cursor-pointer">
                    <img src={selectedChatProf.avatar} className="w-12 h-12 rounded-full" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{selectedChatProf.name}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 truncate">Online</p>
                    </div>
                  </div>
                )}
                {!selectedChatProf && (
                   <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic text-sm">
                      Nenhuma conversa ativa. <br/> Explore profissionais para começar.
                   </div>
                )}
              </div>
            </div>

            {/* Active Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative">
              {selectedChatProf ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white dark:bg-slate-900 p-4 border-b dark:border-slate-800 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                      <img src={selectedChatProf.avatar} className="w-10 h-10 rounded-full" alt="" />
                      <div>
                        <h4 className="font-bold text-sm leading-none">{selectedChatProf.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedChatProf.specialty}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={createContract}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" /> Abrir Contrato
                      </button>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {messages.map(m => (
                      <div key={m.id} className={`flex ${m.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          m.senderId === 'me' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : m.senderId === 'system' 
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700 rounded-tl-none'
                        }`}>
                          <p>{m.text}</p>
                          <span className="text-[10px] block mt-1 opacity-70">{m.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Escreva sua mensagem ou proposta..." 
                        className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                      />
                      <button 
                        onClick={sendMessage}
                        className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <MessageSquare className="w-16 h-16 opacity-20" />
                  <p className="text-sm">Selecione uma conversa para começar a negociar.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PROFILE / SETTINGS SECTION --- */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {viewState === 'default' ? (
              /* Profile View */
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                  <img src="https://picsum.photos/1200/400?profile" className="w-full h-full object-cover opacity-50" alt="" />
                  <button className="absolute top-4 right-4 bg-white/20 backdrop-blur text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-white/30 transition-colors">
                    Editar Capa
                  </button>
                </div>
                <div className="px-8 pb-8">
                  <div className="relative -top-12 flex flex-col md:flex-row md:items-end gap-6">
                    <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-xl">
                      <img src="https://i.pravatar.cc/150?u=me" className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 pb-2">
                      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Seu Nome Profissional</h1>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">Sua Especialidade Principal</p>
                      <div className="flex items-center gap-4 mt-2 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Luanda, Angola</span>
                        <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-500 text-amber-500" /> 4.9 (0 avaliações)</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pb-2">
                      <button 
                        onClick={() => setViewState('settings')}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Configurações"
                      >
                        <Settings className="w-6 h-6" />
                      </button>
                      <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                        Painel de Controle
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                    <div className="md:col-span-2 space-y-8">
                      <section>
                        <h3 className="text-lg font-bold mb-3 border-b dark:border-slate-800 pb-2">Biografia</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          Descreva sua trajetória profissional aqui. Mostre ao mercado angolano do que você é capaz!
                        </p>
                      </section>
                      <section>
                        <h3 className="text-lg font-bold mb-4 border-b dark:border-slate-800 pb-2">Portfólio</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                              <img src={`https://picsum.photos/400/300?p=${i}`} className="w-full h-full object-cover" alt="" />
                            </div>
                          ))}
                          <button className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <PlusCircle className="w-8 h-8 mb-1" />
                            <span className="text-xs font-bold uppercase tracking-widest">Novo Item</span>
                          </button>
                        </div>
                      </section>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h4 className="font-bold mb-4">Informações Rápidas</h4>
                        <ul className="space-y-3 text-sm">
                          <li className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Disponibilidade</span>
                            <span className="font-bold text-green-600">Disponível</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Modalidade</span>
                            <span className="font-bold">Remoto/Presencial</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Tempo de Resposta</span>
                            <span className="font-bold">&lt; 2 horas</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Settings View */
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                <div className="p-6 border-b dark:border-slate-800 flex items-center gap-4">
                  <button 
                    onClick={() => setViewState('default')}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <h2 className="text-xl font-bold">Configurações da Conta</h2>
                </div>

                <div className="p-8 space-y-10">
                  {/* Preferences Group */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Preferências</h3>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            {settings.theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm">Modo de Exibição</p>
                            <p className="text-xs text-slate-500">Alternar entre tema claro e escuro</p>
                          </div>
                        </div>
                        <button 
                          onClick={toggleTheme}
                          className="w-14 h-8 bg-slate-200 dark:bg-slate-700 rounded-full p-1 relative transition-colors cursor-pointer"
                        >
                          <div className={`w-6 h-6 bg-white dark:bg-blue-600 rounded-full shadow-md transform transition-transform duration-200 ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                            <Bell className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">Notificações Push</p>
                            <p className="text-xs text-slate-500">Alertas de mensagens e novos contratos</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                          className={`w-14 h-8 rounded-full p-1 relative transition-colors cursor-pointer ${settings.notifications ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${settings.notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Localization Group */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Localização e Idioma</h3>
                    <div className="space-y-1">
                      <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm">Idioma</p>
                            <p className="text-xs text-slate-500">{settings.language === 'pt' ? 'Português (AO)' : 'English (US)'}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>

                      <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm">Região Padrão</p>
                            <p className="text-xs text-slate-500">{userLocation.city}, {userLocation.province}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </section>

                  {/* Security Group */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Segurança</h3>
                    <div className="space-y-1">
                      <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm">Alterar Password</p>
                            <p className="text-xs text-slate-500">Última alteração há 3 meses</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>

                      <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm">Modo de Privacidade</p>
                            <p className="text-xs text-slate-500">Esconder perfil de buscas externas</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSettings(s => ({ ...s, privacyMode: !s.privacyMode }))}
                          className={`w-14 h-8 rounded-full p-1 relative transition-colors cursor-pointer ${settings.privacyMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${settings.privacyMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                      </div>
                    </div>
                  </section>

                  <div className="pt-8 flex gap-4">
                    <button className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                      Guardar Alterações
                    </button>
                    <button 
                      onClick={() => setViewState('default')}
                      className="px-8 py-3 border border-slate-200 dark:border-slate-800 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- CONTRACT MODAL --- */}
      {showContractModal && selectedChatProf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowContractModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/10">
            <div className="bg-slate-900 dark:bg-slate-800 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-400" /> Formalizar Contrato
                </h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Digital Signature Protocol</p>
              </div>
              <button onClick={() => setShowContractModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                 <img src={selectedChatProf.avatar} className="w-16 h-16 rounded-2xl shadow-md" alt="" />
                 <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Profissional Contratado</p>
                    <h4 className="font-bold text-lg">{selectedChatProf.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedChatProf.specialty}</p>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Escopo do Trabalho</label>
                  <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-3 text-sm focus:border-blue-500 outline-none h-24 dark:text-white"
                    defaultValue={activeContract?.scope}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Valor do Acordo</label>
                    <div className="relative">
                       <input 
                        type="text" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-3 pl-10 font-bold dark:text-white"
                        defaultValue={activeContract?.price}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Kz</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Prazo Estimado</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-3 font-bold dark:text-white"
                      defaultValue={activeContract?.deadline}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200 dark:border-slate-700">
                  Ao assinar digitalmente, ambas as partes concordam com os termos de prestação de serviço estabelecidos na plataforma Conecta+. O pagamento deve ser processado via sistema escrow para garantia de entrega.
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t dark:border-slate-800 flex flex-col gap-3">
              <button 
                onClick={signContract}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
              >
                {activeContract?.status === ContractStatus.ACTIVE ? 'Contrato Ativo ✅' : 'Assinar Digitalmente'}
              </button>
              <button 
                onClick={() => setShowContractModal(false)}
                className="w-full py-3 text-slate-500 dark:text-slate-400 text-sm font-bold"
              >
                Cancelar e Voltar à Conversa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
