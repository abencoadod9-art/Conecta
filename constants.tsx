
import { Professional, Post, Product } from './types';

export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'p1',
    name: 'António Manuel',
    role: 'Desenvolvedor Full-Stack',
    specialty: 'React, Node.js & Mobile',
    location: { country: 'Angola', province: 'Luanda', city: 'Luanda' },
    bio: 'Especialista em criar soluções digitais para o mercado angolano.',
    rating: 4.9,
    reviewCount: 124,
    portfolio: ['https://picsum.photos/400/300?1', 'https://picsum.photos/400/300?2'],
    badges: ['Verificado', 'Top Avaliado'],
    availability: 'REMOTE',
    hourlyRate: 25,
    experienceYears: 5,
    avatar: 'https://i.pravatar.cc/150?u=p1',
    coverImage: 'https://picsum.photos/1200/400?1'
  },
  {
    id: 'p2',
    name: 'Elsa Santos',
    role: 'Designer Gráfica',
    specialty: 'Branding & UI/UX',
    location: { country: 'Angola', province: 'Benguela', city: 'Benguela' },
    bio: 'Transformando ideias em identidades visuais impactantes.',
    rating: 4.7,
    reviewCount: 89,
    portfolio: ['https://picsum.photos/400/300?3', 'https://picsum.photos/400/300?4'],
    badges: ['Verificado'],
    availability: 'HYBRID',
    hourlyRate: 15,
    experienceYears: 3,
    avatar: 'https://i.pravatar.cc/150?u=p2',
    coverImage: 'https://picsum.photos/1200/400?2'
  },
  {
    id: 'p3',
    name: 'Carlos Bento',
    role: 'Eletricista Certificado',
    specialty: 'Instalações Residenciais',
    location: { country: 'Angola', province: 'Luanda', city: 'Talatona' },
    bio: 'Serviços elétricos com segurança e rapidez.',
    rating: 4.8,
    reviewCount: 56,
    portfolio: [],
    badges: ['Verificado', 'Entrega Rápida'],
    availability: 'FULL_TIME',
    hourlyRate: 10,
    experienceYears: 8,
    avatar: 'https://i.pravatar.cc/150?u=p3',
    coverImage: 'https://picsum.photos/1200/400?3'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    userId: 'p1',
    userName: 'António Manuel',
    userAvatar: 'https://i.pravatar.cc/150?u=p1',
    content: 'Acabei de lançar o novo portal de e-commerce para uma loja local! O mercado digital em Angola não para de crescer. 🚀',
    image: 'https://picsum.photos/800/600?tech',
    likes: 45,
    comments: 12,
    timestamp: '2h atrás'
  },
  {
    id: 'post2',
    userId: 'p2',
    userName: 'Elsa Santos',
    userAvatar: 'https://i.pravatar.cc/150?u=p2',
    content: 'Design não é apenas o que parece, é como funciona. Novo projeto de UI finalizado hoje.',
    likes: 82,
    comments: 5,
    timestamp: '5h atrás'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    name: 'Curso de Marketing Digital Pro',
    description: 'Aprenda a vender nas redes sociais com foco no mercado africano.',
    price: 5000,
    type: 'COURSE',
    category: 'Educação',
    images: ['https://picsum.photos/400/400?course'],
    rating: 5,
    stock: 999,
    vendorId: 'p1'
  },
  {
    id: 'prod2',
    name: 'Mochila Profissional Tech',
    description: 'Resistente e com compartimento para laptop de até 17 polegadas.',
    price: 15000,
    type: 'PHYSICAL',
    category: 'Acessórios',
    images: ['https://picsum.photos/400/400?bag'],
    rating: 4.5,
    stock: 12,
    vendorId: 'v1'
  }
];
