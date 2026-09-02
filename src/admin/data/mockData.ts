export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  joined: string;
  bookings: number;
  spent: number;
  role: "traveler" | "guide" | "hotel_manager" | "admin";
  status: "active" | "suspended" | "unverified";
  avatar: string;
  lastSeen: string;
  location: { lat: number; lng: number; city: string };
  locationHistory: Array<{ lat: number; lng: number; city: string; time: string }>;
};

export const USERS: User[] = [
  {
    id: 1, name: "Alisher Nazarov", email: "ali.nazarov@mail.uz", phone: "+998 90 123 4567",
    country: "Uzbekistan", flag: "🇺🇿", joined: "Jan 12, 2025", bookings: 8, spent: 12840,
    role: "traveler", status: "active", avatar: "A", lastSeen: "2 min ago",
    location: { lat: 41.3, lng: 69.3, city: "Tashkent" },
    locationHistory: [
      { lat: 39.65, lng: 66.97, city: "Samarkand", time: "Aug 28, 09:00" },
      { lat: 40.35, lng: 68.93, city: "Jizzakh", time: "Aug 29, 14:00" },
      { lat: 41.3, lng: 69.3, city: "Tashkent", time: "Sep 1, 10:00" },
    ],
  },
  {
    id: 2, name: "Maria Chen", email: "m.chen@gmail.com", phone: "+86 139 0000 1234",
    country: "China", flag: "🇨🇳", joined: "Mar 4, 2025", bookings: 3, spent: 2100,
    role: "traveler", status: "active", avatar: "M", lastSeen: "15 min ago",
    location: { lat: 39.65, lng: 66.97, city: "Samarkand" },
    locationHistory: [
      { lat: 41.3, lng: 69.3, city: "Tashkent", time: "Aug 30, 07:00" },
      { lat: 39.65, lng: 66.97, city: "Samarkand", time: "Sep 1, 12:00" },
    ],
  },
  {
    id: 3, name: "James Walker", email: "j.walker@outlook.com", phone: "+44 7700 900123",
    country: "UK", flag: "🇬🇧", joined: "Feb 19, 2024", bookings: 12, spent: 18400,
    role: "traveler", status: "active", avatar: "J", lastSeen: "1 hr ago",
    location: { lat: 39.77, lng: 64.43, city: "Bukhara" },
    locationHistory: [
      { lat: 41.55, lng: 60.63, city: "Khiva", time: "Aug 25, 10:00" },
      { lat: 39.77, lng: 64.43, city: "Bukhara", time: "Aug 27, 15:00" },
      { lat: 39.65, lng: 66.97, city: "Samarkand", time: "Aug 29, 11:00" },
      { lat: 39.77, lng: 64.43, city: "Bukhara", time: "Sep 1, 08:00" },
    ],
  },
  {
    id: 4, name: "Fatima Al-Hassan", email: "fatima.h@dubai.ae", phone: "+971 50 123 4567",
    country: "UAE", flag: "🇦🇪", joined: "Aug 9, 2026", bookings: 1, spent: 670,
    role: "traveler", status: "unverified", avatar: "F", lastSeen: "3 hr ago",
    location: { lat: 40.36, lng: 71.78, city: "Fergana" },
    locationHistory: [
      { lat: 41.3, lng: 69.3, city: "Tashkent", time: "Sep 1, 09:00" },
      { lat: 40.36, lng: 71.78, city: "Fergana", time: "Sep 1, 16:00" },
    ],
  },
  {
    id: 5, name: "Dmitri Volkov", email: "d.volkov@yandex.ru", phone: "+7 916 123 4567",
    country: "Russia", flag: "🇷🇺", joined: "Nov 3, 2025", bookings: 1, spent: 0,
    role: "traveler", status: "suspended", avatar: "D", lastSeen: "2 days ago",
    location: { lat: 41.55, lng: 60.63, city: "Khiva" },
    locationHistory: [
      { lat: 41.55, lng: 60.63, city: "Khiva", time: "Aug 29, 18:00" },
    ],
  },
  {
    id: 6, name: "Sophie Bernhard", email: "s.bernhard@gmail.de", phone: "+49 30 12345678",
    country: "Germany", flag: "🇩🇪", joined: "Apr 22, 2024", bookings: 7, spent: 9200,
    role: "traveler", status: "active", avatar: "S", lastSeen: "30 min ago",
    location: { lat: 39.65, lng: 66.97, city: "Samarkand" },
    locationHistory: [
      { lat: 41.3, lng: 69.3, city: "Tashkent", time: "Aug 22, 07:00" },
      { lat: 39.65, lng: 66.97, city: "Samarkand", time: "Aug 24, 12:00" },
      { lat: 39.77, lng: 64.43, city: "Bukhara", time: "Aug 26, 10:00" },
      { lat: 41.55, lng: 60.63, city: "Khiva", time: "Aug 28, 09:00" },
      { lat: 39.65, lng: 66.97, city: "Samarkand", time: "Sep 1, 14:00" },
    ],
  },
  {
    id: 7, name: "Bobur Tashkentov", email: "bobur.t@uztravel.uz", phone: "+998 91 234 5678",
    country: "Uzbekistan", flag: "🇺🇿", joined: "Mar 1, 2023", bookings: 0, spent: 0,
    role: "guide", status: "active", avatar: "B", lastSeen: "5 min ago",
    location: { lat: 39.65, lng: 66.97, city: "Samarkand" },
    locationHistory: [
      { lat: 39.65, lng: 66.97, city: "Samarkand", time: "Sep 1, 07:00" },
    ],
  },
  {
    id: 8, name: "Yuki Tanaka", email: "yuki.t@jp.co", phone: "+81 3 1234 5678",
    country: "Japan", flag: "🇯🇵", joined: "Jan 15, 2026", bookings: 2, spent: 1860,
    role: "traveler", status: "active", avatar: "Y", lastSeen: "10 min ago",
    location: { lat: 41.09, lng: 64.43, city: "Nurata" },
    locationHistory: [
      { lat: 41.3, lng: 69.3, city: "Tashkent", time: "Aug 30, 06:00" },
      { lat: 41.09, lng: 64.43, city: "Nurata", time: "Sep 1, 11:00" },
    ],
  },
  {
    id: 9, name: "Ahmed Khalil", email: "a.khalil@eg.com", phone: "+20 100 123 4567",
    country: "Egypt", flag: "🇪🇬", joined: "Jul 1, 2025", bookings: 4, spent: 14200,
    role: "traveler", status: "active", avatar: "A", lastSeen: "45 min ago",
    location: { lat: 41.3, lng: 69.3, city: "Tashkent" },
    locationHistory: [
      { lat: 41.3, lng: 69.3, city: "Tashkent", time: "Sep 1, 14:00" },
    ],
  },
];

export type Message = {
  id: number;
  userId: number;
  from: "user" | "admin";
  text: string;
  time: string;
  read: boolean;
};

export const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, userId: 1, from: "user", text: "Салом! Хочу узнать подробности тура Silk Road Classic", time: "10:21", read: true },
    { id: 2, userId: 1, from: "admin", text: "Здравствуйте! Тур начинается 8 сентября в Ташкенте. Что именно хотите уточнить?", time: "10:23", read: true },
    { id: 3, userId: 1, from: "user", text: "Включено ли питание в стоимость?", time: "10:25", read: true },
    { id: 4, userId: 1, from: "admin", text: "Да, завтраки и обеды включены. Ужины по желанию.", time: "10:26", read: true },
  ],
  2: [
    { id: 1, userId: 2, from: "user", text: "Hello, is the Registan tour available for September 3rd?", time: "09:15", read: true },
    { id: 2, userId: 2, from: "admin", text: "Yes! We have spots available. Would you like to book for 1 or 2 people?", time: "09:18", read: true },
    { id: 3, userId: 2, from: "user", text: "Just 1. Can I pay in installments?", time: "09:20", read: false },
  ],
  3: [
    { id: 1, userId: 3, from: "user", text: "Hi, I've done 12 tours with you and I'm looking for something new. Any hidden gems?", time: "Yesterday", read: true },
    { id: 2, userId: 3, from: "admin", text: "Welcome back James! You'd love the new Aral Sea Expedition — very few operators run it.", time: "Yesterday", read: true },
  ],
  6: [
    { id: 1, userId: 6, from: "user", text: "Guten Tag! Ich möchte Informationen über das Bukhara Jewish Heritage tour", time: "Aug 30", read: true },
    { id: 2, userId: 6, from: "admin", text: "Hello Sophie! That tour is currently paused but we expect it to resume in October.", time: "Aug 30", read: true },
  ],
  8: [
    { id: 1, userId: 8, from: "user", text: "The Nurata yurt stay was absolutely incredible. 5 stars!", time: "2 hr ago", read: false },
    { id: 2, userId: 8, from: "user", text: "Can I book the same experience for December?", time: "2 hr ago", read: false },
  ],
  9: [
    { id: 1, userId: 9, from: "user", text: "I need to book 6 spots on the Silk Road tour for October 15", time: "1 hr ago", read: false },
  ],
};
