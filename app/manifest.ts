import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ВУЗадачи - Отслеживайте свои учебные задачи эффективно',
    short_name: 'ВУЗадачи',
    description: 'Приложение для управления учебными задачами, интегрированное с твоим расписанием. Создавайте задачи на основе расписания и кастомные задачи, устанавливайте сроки и получайте уведомления.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}